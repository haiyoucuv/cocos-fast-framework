import { _decorator, Button, Node, sys } from "cc";
import Scene from "db://assets/core/ui/module/Scene";
import { changeScene, hideWaiting, showPanel, showWaiting } from "db://assets/core/ui/UIFast";
import { observer, render } from "db://assets/core/mobx/decorators";
import { MainGame } from "./MainGame/MainGame";
import store from "../store/store";
import { _asyncThrottle } from "../Utils/Utils";
import WelcomePanel from "../Panels/WelcomePanel";

const { ccclass, property } = _decorator;

@observer
@ccclass("HomeScene")
export class HomeScene extends Scene {

    static bundle: string = "HomeScene";
    static skin: string = "HomeScene";

    @property(Node) startBtn: Node = null;

    onLoad() {
        this.startBtn.on(Button.EventType.CLICK, this.clickStart, this);
    }

    async start() {
        showWaiting();
        await store.updateIndex();
        hideWaiting();

        const {  } = store.userData;

        showPanel(WelcomePanel);

    }

    @render
    render() {
        const {} = store.userData || {};

    }


    clickStart = _asyncThrottle(async () => {

        changeScene(MainGame);

    });

}

