import { _decorator, Component, Node } from 'cc';
import { loadAllObject } from "db://assets/Scripts/Utils/Utils";

const {ccclass, property} = _decorator;

@ccclass('UILayer')
export class UILayer extends Component {
    view: { [key in string]: Node } = {};

    onLoad() {
        this.view = loadAllObject(this.node);
    }
}

