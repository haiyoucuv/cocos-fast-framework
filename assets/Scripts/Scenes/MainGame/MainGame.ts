import {
    _decorator,
} from "cc";
import Scene from "db://assets/core/ui/module/Scene";
import { observer, render } from "db://assets/core/mobx/decorators";

const { ccclass, property } = _decorator;

@observer
@ccclass("MainGame")
export class MainGame extends Scene {

    static bundle: string = "MainGame";
    static skin: string = "MainGame";

    async onLoad() {

    }

    async start() {

    }

    onDestroy() {

    }


    @render
    render() {

    }

    update(dt: number) {
        
    }



}