import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import { Vector } from 'ol/source';
import {fromLonLat} from 'ol/proj';
import { ZoomToExtent, Attribution, defaults as defaultControls } from 'ol/control';  



const vectorSource = new SourceVector({
  format: new GeoJSON(),
  url: function(extent) {
    return 'http://localhost:8080/geoserver/Bakhit/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Bakhit:districts&outputFormat=application/json'
  },
  strategy: bboxStrategy,
});

const vector = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2,
    }),
  }),
});

const attribution = new Attribution({
  collapsible: false,
});

const baselayer = new TileLayer({
  source: new OSM(),
  zIndex: 0,  // Set zIndex for layering order
});

// const tile = new TileLayer({
//   source: new XYZ({
//     url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
//   }),
//   zIndex: 1,
//   opacity: 0.7 
// }); 
const map = new Map({
  controls: defaultControls().extend([
    new ZoomToExtent({
      extent: [
        6239286.061647, 4458669.779588, 8140230.358761, 5732277.463203
      ],
    }),
  ]), 
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
  target: 'map',
  layers: [baselayer, vector],
  view: new View({
    center: fromLonLat([64.1339863, 41.5193823]),
    zoom: 6
    
  })
});


let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('district_n') || '&nbsp;';
  } else {
    info.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      vector.getSource().removeFeature(highlight);
    }
    if (feature) {
      vector.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
function checkSize() {
  const small = map.getSize()[0] < 600;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}

map.on('change:size', checkSize);
checkSize();

