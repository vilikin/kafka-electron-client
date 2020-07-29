import { Action } from "overmind";

export const toggleProduceModal: Action<boolean> = ({ state }, open) => {
  state.produceModal.modalOpen = open;
};
