import { _decorator, Node, } from "cc";
import { observer, render } from "db://assets/core/mobx/decorators";
import Panel from "db://assets/core/ui/module/Panel";

const { ccclass, property } = _decorator;

@observer
@ccclass("WelcomePanel")
export default class WelcomePanel extends Panel {

    static bundle = "WelcomePanel";
    static skin = "WelcomePanel";

    @property(Node) closeBtn: Node = null;

    onLoad() {
        this.closeBtn.on(Node.EventType.TOUCH_END, this.clickClose, this);
    }

    clickClose = () => {
        this.hidePanel();
    };
}
