import mobx from "mobx";
const { makeAutoObservable } = mobx;

class GameStore {


}


const gameStore: GameStore = makeAutoObservable(new GameStore());

export default gameStore;