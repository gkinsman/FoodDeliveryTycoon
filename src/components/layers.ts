type LayerNames = "AvailableCommercialBuildings" | "Houses";

interface VisibilityState {
  [key: string]: boolean;
}

interface LayerState {
  visibilities: VisibilityState;
}

const state: LayerState = {
  visibilities: {
    AvailableCommercialBuildings: true,
    Houses: true,
  },
};

export function useLayers() {
  function setLayerVisbility(layer: string, visible: boolean) {
    state.visibilities[layer] = visible;
  }

  function getLayerVisbility(layer: string) {
    return state.visibilities[layer];
  }

  return {
    setLayerVisbility,
    getLayerVisbility,
  };
}
