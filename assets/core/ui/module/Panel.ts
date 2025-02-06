import { _decorator, easing, Node, tween, v3 } from "cc";
import Module from "./Module";
import { hidePanel } from "../UIFast";
import { loadAllObject } from "db://assets/Scripts/Utils/Utils";
import { UIMgr } from "../UIMgr";

const { ccclass, property } = _decorator;

@ccclass()
export default class Panel extends Module {

    static EventType = {
        ON_CLOSE: "onClose",
    };

    view: { [key in string]: Node } = {};

    onLoad() {
        this.view = loadAllObject(this.node);
    }

    onShow() {
        this.node.setScale(v3(0, 0, 1));
        tween(this.node)
            .to(0.188, { scale: v3(1, 1, 1) }, { easing: easing.quadInOut })
            .start();
    }

    hidePanel() {
        this.node.emit(Panel.EventType.ON_CLOSE);
        hidePanel();
    }

    hideAllPanel() {
        this.node.emit(Panel.EventType.ON_CLOSE);
        UIMgr.ins.hideAllPanel();
    }

}
