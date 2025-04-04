import folium
import pandas as pd
from shapely.wkt import loads  # To parse WKT polygons
import gdown

# Read the CSV file
file_id = "FILE_ID"
url = f"https://drive.google.com/uc?id={file_id}"
output = "precip_processed.csv"  # 保存的文件名
gdown.download(url, output, quiet=False)

data = pd.read_csv('precipt_processed.csv')
# Create a base map
m = folium.Map(location=[-35.5, 149.0], zoom_start=10)

# Parse the WKT polygons
geometry = data['geometry'].apply(loads)

# Iterate through each geometry
for i, geom in enumerate(geometry):
    # Check if the geometry is a Polygon
    if geom.geom_type == 'Polygon':
        coords = list(geom.exterior.coords)  # Extract exterior coordinates
        folium.Polygon(
            locations=[(lat, lon) for lon, lat in coords],  # Convert to (lat, lon)
            color="blue",
            fill=True,
            fill_color="lightblue",
            fill_opacity=0.5
        ).add_to(m)
    # Check if the geometry is a MultiPolygon
    elif geom.geom_type == 'MultiPolygon':
        for polygon in geom.geoms:  # Iterate through each sub-polygon
            coords = list(polygon.exterior.coords)
            folium.Polygon(
                locations=[(lat, lon) for lon, lat in coords],  # Convert to (lat, lon)
                color="blue",
                fill=True,  
                fill_color="lightblue",
                fill_opacity=0.5
            ).add_to(m)

# Save the map to an HTML file
m.save('polygons_map.html')