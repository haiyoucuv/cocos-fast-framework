import mobx from "mobx";

const { makeAutoObservable } = mobx;

class ShareStore {

}

const shareStore: ShareStore = makeAutoObservable(new ShareStore());

export default shareStore;