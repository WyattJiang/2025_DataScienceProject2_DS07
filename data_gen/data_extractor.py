import os
import requests
import netCDF4 as nc
import numpy as np
import pandas as pd
import h3
from shapely.geometry import Polygon
from shapely import wkt 
import folium
import geopandas as gpd
from shapely.ops import nearest_points
from geopandas.tools import sjoin_nearest
# import tqdm.notebook as tqdm

class DataExtractor:
    def __init__(self, metric="all", year_range=(2000, 2020)):
        self.metric = metric
        self.year_range = year_range
        self._precip_list = [
            f"https://thredds.nci.org.au/thredds/fileServer/zv2/agcd/v1/precip/total/r005/01month/agcd_v1_precip_total_r005_monthly_{i}.nc"
            for i in range(self.year_range[0], self.year_range[1]+1)
        ]
        self._tmax_list = [
            f"https://thredds.nci.org.au/thredds/catalog/zv2/agcd/v1/tmax/mean/r005/01month/catalog.html?dataset=zv2/tmax/mean/r005/01month/agcd_v1_tmax_mean_r005_monthly_{i}.nc"
            for i in range(self.year_range[0], self.year_range[1]+1)
        ]
        self._tmin_list = [
            f"https://thredds.nci.org.au/thredds/fileServer/grid/zv2/agcd/v1/tmin/mean/r005/01month/agcd_v1_tmin_mean_r005_monthly_{i}.nc"
            for i in range(self.year_range[0], self.year_range[1]+1)
        ] 

    def download_catalog(self, variables):
        for var in variables:
            self._download_data(var)

    def process_catalog(self, variables):
        dfs = {"precip": [],
               "tmin": [],
               "tmax": []}
        for var in variables:
            if var == "precip":
                for i in self._precip_list:
                    processed_df = self._build_df(var, i)
                    dfs[var] += [processed_df]
            if var == "tmax":
                for i in self._tmax_list:
                    processed_df = self._build_df(var, i)
                    dfs[var] += [processed_df]
            if var == "tmin":
                for i in self._tmin_list:
                    processed_df = self._build_df(var, i)
                    dfs[var] += [processed_df]
        
        precip_df = pd.DataFrame()
        tmin_df = pd.DataFrame()
        tmax_df = pd.DataFrame()

        for metric in dfs:
            for i in range(len(dfs[metric])):
                if metric == "precip":
                    if i == 0:
                        precip_df = dfs[metric][i]
                    else:
                        dfs[metric][i] = dfs[metric][i].drop(columns=["lat", "lon"])
                        precip_df = pd.concat([precip_df, dfs[metric][i]], axis=1)
            for i in range(len(dfs[metric])):
                if metric == "tmax":
                    if i == 0:
                        tmax_df = dfs[metric][i]
                    else:
                        dfs[metric][i] = dfs[metric][i].drop(columns=["lat", "lon"])
                        tmax_df = pd.concat([tmax_df, dfs[metric][i]], axis=1)
            for i in range(len(dfs[metric])):
                if metric == "tmin":
                    if i == 0:
                        tmin_df = dfs[metric][i]
                    else:
                        dfs[metric][i] = dfs[metric][i].drop(columns=["lat", "lon"])
                        tmin_df = pd.concat([tmin_df, dfs[metric][i]], axis=1)

        return precip_df, tmin_df, tmax_df
         
    
    def aggregate_shape(self, df):
        # Climate points as GeoDataFrame
        climate_gdf = gpd.GeoDataFrame(
            df.drop(columns=['lat', 'lon']),
            geometry=gpd.points_from_xy(df.lon, df.lat),
            crs="EPSG:7844"
        )

        # Load suburbs and set matching CRS
        suburbs_gdf = gpd.read_file("../../data/raw/SAL_2021_AUST_GDA2020.shp").to_crs(climate_gdf.crs)

        # Spatial join with nearest neighbor to ensure all suburbs matched
        joined = gpd.sjoin_nearest(suburbs_gdf, climate_gdf, how="left", distance_col="distance")

        # Climate variables (excluding geometry and distance)
        climate_vars = df.columns.drop(['lat', 'lon']).tolist()

        # Aggregate climate data by suburb and state
        climate_df = joined.groupby(['SAL_NAME21', 'STE_NAME21'])[climate_vars].mean().reset_index()

        # Polygon geometry DataFrame
        geometry_gdf = suburbs_gdf[['SAL_NAME21', 'geometry']].copy()

        return climate_df, geometry_gdf
    
    def aggregate_h3_australia(self, df, suburb_polygons, resolution=6):
        df = df.copy()

        # Assign hex IDs
        df['hex_id'] = df.apply(
            lambda row: h3.latlng_to_cell(row['lat'], row['lon'], resolution), axis=1
        )

        # Aggregate climate variables
        climate_vars = df.columns.drop(['lat', 'lon', 'hex_id']).tolist()
        aggregated_df = df.groupby('hex_id')[climate_vars].mean().reset_index()

        # Generate hexagon polygons
        aggregated_df['geometry'] = aggregated_df['hex_id'].apply(
            lambda hex_id: Polygon(
                [(lng, lat) for lat, lng in h3.cell_to_boundary(hex_id)]
            )
        )

        aggregated_gdf = gpd.GeoDataFrame(aggregated_df, geometry='geometry', crs='EPSG:4326')

        # Fast spatial join instead of unary_union
        aggregated_gdf = gpd.sjoin(
            aggregated_gdf, suburb_polygons[['geometry']],
            predicate='intersects', how='inner'
        ).drop(columns=['index_right']).drop_duplicates(subset='hex_id')

        # Separate data and geometry
        hexagon_polygons = aggregated_gdf[['hex_id', 'geometry']].copy()
        hexagon_data = aggregated_gdf.drop(columns='geometry')

        return hexagon_data, hexagon_polygons



    
    def _build_df(self, variable, n):
        dataset = nc.Dataset(f"../../data/raw/{variable}/{n.split('/')[-1]}")
        lst = []

        if n[-7:-3] == "2020":
            for i in range(5): #  only 5 months available for 2020
                data = dataset.variables[variable][[i][0]]
                data = pd.DataFrame(data)
                data = data.set_index(dataset["lat"][:])
                data.columns = dataset["lon"][:]
                data = pd.DataFrame(data.stack()).reset_index()
                if i == 0:
                    data.columns = ["lat", "lon", variable]
                    lst.append(data)
                else: 
                    data.columns = ["lat", "lon", variable] # keep coordinate labels only for one month as all months will be the same
                    data = data.drop(columns=["lat", "lon"])
                    lst.append(data)
        else:
            for i in range(12): # 12 for 12 monhs of the year
                data = dataset.variables[variable][[i][0]]
                data = pd.DataFrame(data)
                data = data.set_index(dataset["lat"][:])
                data.columns = dataset["lon"][:]
                data = pd.DataFrame(data.stack()).reset_index()
                if i == 0:
                    data.columns = ["lat", "lon", variable]
                    lst.append(data)
                else: 
                    data.columns = ["lat", "lon", variable] # keep coordinate labels only for one month as all months will be the same
                    data = data.drop(columns=["lat", "lon"])
                    lst.append(data)

        # combined data into one dataframe with correctly named columns
        final_df = lst[0]
        final_df.columns = ["lat", "lon", f"{n[-7:-3]}_month_{1}"]
        if n[-7:-3] != "2020":
            for i in range(1, 12): # skipping the first month and doping all 12 months
                final_df[f"{n[-7:-3]}_month_{i+1}"] = lst[i][variable].values
        else:
            for i in range(1, 5): # skipping the first month and only doing up to 5
                final_df[f"{n[-7:-3]}_month_{i+1}"] = lst[i][variable].values
        return final_df


    def _download_data(self, variable):
        # Make base directories
        self._make_base_directories()
        if variable == "precip":
            os.makedirs("../../data/raw/precip", exist_ok=True)
            for ds in self._precip_list:
                link = ds
                response = requests.get(link)
                            
                # Write the downloaded content to a local file
                with open(f"../../data/raw/precip/{ds.split('/')[-1]}", 'wb') as f:
                    f.write(response.content)
        elif variable == "tmax":
            os.makedirs("../../data/raw/tmax", exist_ok=True)
            for ds in self._tmax_list:
                link = ds
                response = requests.get(ds)
                            
                # Write the downloaded content to a local file
                with open(f"../../data/raw/tmax/{ds.split('/')[-1]}", 'wb') as f:
                    f.write(response.content)
        elif variable == "tmin":
            os.makedirs("../../data/raw/tmin", exist_ok=True)
            for ds in self._tmin_list:
                link = ds
                response = requests.get(ds)
                            
                # Write the downloaded content to a local file
                with open(f"../../data/raw/tmin/{ds.split('/')[-1]}", 'wb') as f:
                    f.write(response.content)
        else:
            print("Invalid catalog name")
        

    def _make_base_directories(self, root = "../"):
        # Initialise directories for raw and processed
        os.makedirs(f"{root}data", exist_ok=True)
        os.makedirs(f"{root}data/raw", exist_ok=True)
        os.makedirs(f"{root}data/processed", exist_ok=True)