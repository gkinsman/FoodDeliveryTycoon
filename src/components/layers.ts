import mapboxgl from "mapbox-gl";
import { ref, Ref } from "vue";

type LayerNames = "commercial-buildings" | "Houses";

interface VisibilityState {
  [key: string]: boolean;
}

interface LayerState {
  visibilities: Ref<VisibilityState>;
}

const state: LayerState = {
  visibilities: ref({
    "commercial-buildings": true,
    Houses: true,
  }),
};

export function useLayers() {
  function setLayerVisibility(
    map: mapboxgl.Map,
    layer: string,
    visible: boolean
  ) {
    map.setPaintProperty(layer, "fill-opacity", visible ? 1 : 0);
    state.visibilities.value[layer] = visible;
  }

  function getLayerVisibility(layer: string) {
    return state.visibilities.value[layer];
  }

  return {
    getLayers: () => Object.keys(state.visibilities.value),
    setLayerVisibility,
    getLayerVisibility,
  };
}
