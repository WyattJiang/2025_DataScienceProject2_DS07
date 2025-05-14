import React from 'react';
import { X } from 'lucide-react';

type DataCitationsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DataCitationsModal: React.FC<DataCitationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Data Sources & Processing</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
              <span className="mr-2">📚</span>
              Data Sources
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Australian Bureau of Meteorology (BoM)</h3>
                <p className="mb-2">
                  <span className="font-medium">Source:</span> Australian Bureau of Meteorology. (2020). 
                  <em> Australian Gridded Climate Data (AGCD)</em> [Data set]. National Computational Infrastructure (NCI).
                </p>
                <div className="flex items-center mb-2">
                  <a 
                    href="https://thredds.nci.org.au/thredds/catalog/zv2/agcd/v1/catalog.html" 
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View dataset
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Provides high-resolution (5×5 km) monthly climate variables: precipitation, maximum temperature, and minimum temperature.</li>
                  <li>Data interpolated from weather station measurements using statistical and geospatial techniques.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Australian Bureau of Statistics (ABS)</h3>
                <p className="mb-2">
                  <span className="font-medium">Source:</span> Australian Bureau of Statistics. (2021). 
                  <em> Statistical Area Level 2 (SAL) Boundaries – ASGS 2021</em> [Shapefile].
                </p>
                <div className="flex items-center mb-2">
                  <a 
                    href="https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/latest-release/digital-boundary-files" 
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    View shapefile
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Defines the geographic boundaries of Australian suburbs.</li>
                  <li>Used for spatial aggregation and filtering during data processing.</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
              <span className="mr-2">🔄</span>
              Data Transformation Methodology
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                  <span className="mr-2">🌦</span>
                  Climate Grid Processing
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li><span className="font-medium">Download & Parse:</span> NetCDF files downloaded from AGCD and parsed using the <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">netCDF4</code> Python library.</li>
                  <li>
                    <span className="font-medium">Monthly to Seasonal Aggregation:</span>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Summer: December – February (December belongs to the following year)</li>
                      <li>Autumn: March – May</li>
                      <li>Winter: June – August</li>
                      <li>Spring: September – November</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                  <span className="mr-2">📊</span>
                  Suburb-Level Aggregation (for Trend Graphs)
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Gridded climate points were converted into geographic points.</li>
                  <li>Spatially joined to suburb boundaries using nearest-neighbor join.</li>
                  <li>Suburb-level means calculated per variable, per month and season.</li>
                  <li><span className="font-medium">Note:</span> This dataset is used for line charts, but not directly shown on the map.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                  <span className="mr-2">🧩</span>
                  Hex-Level Aggregation (for Mapping)
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Each point was assigned to an H3 hexagon (resolution 4–6) using the <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">h3</code> library.</li>
                  <li>Values were averaged by hex ID.</li>
                  <li>Only hexagons overlapping suburb boundaries were kept.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 flex items-center mb-2">
                  <span className="mr-2">🗺️</span>
                  Map Generation
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Hex-level summaries were saved and visualized using <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">folium</code>.</li>
                  <li>Exported maps as standalone <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">.html</code> files and embedded via <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">&lt;iframe&gt;</code> in the React app.</li>
                  <li>When a hexagon is clicked, its <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">hex_id</code> is sent back to React using <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600">postMessage</code> for real-time interaction.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataCitationsModal;