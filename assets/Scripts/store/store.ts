import mobx from "mobx";
import { sendWebNet, WebNetName } from "../Utils/WebNet/WebNet";
import { sys } from "cc";

const { makeAutoObservable } = mobx;


class Store {

    ruleInfo = "";

    async updateRule() {
        const { success, data } = await sendWebNet(WebNetName.projectRule);
        if (!success) {
            return;
        }
        this.ruleInfo = data;
    }


    userData = {
        firstLogin: true,
    };

    async updateIndex() {

        const userData = sys.localStorage.getItem("userData") || null;

        this.userData = {
            ...this.userData,
            ...JSON.parse(userData),
        };

    }

    setGuideCompleted() {
        this.userData.firstLogin = false;
        this.saveUserData();
    }

    saveUserData() {
        sys.localStorage.setItem("userData", JSON.stringify(this.userData));
    }

}


const store: Store = makeAutoObservable(new Store());

export default store;