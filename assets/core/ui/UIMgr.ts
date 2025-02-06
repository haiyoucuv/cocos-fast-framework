import {
    AssetManager,
    assetManager, Button,
    director,
    error,
    instantiate,
    Label,
    Node,
    Prefab,
    tween,
    UIOpacity,
} from "cc";
import Scene from "./module/Scene";
import Panel from "./module/Panel";
import RES from "../res/RES";


export class UIMgr {

    private static _ins: UIMgr = null;
    static get ins() {
        if (!UIMgr._ins) UIMgr._ins = new UIMgr();
        return UIMgr._ins;
    }

    uiCanvas: Node;

    setup(uiPrefab: Node | Prefab) {
        if (this.uiCanvas) {
            return;
        }

        if (!uiPrefab) {
            throw error("必须是Node或Prefab");
        }

        if (uiPrefab instanceof Prefab) {
            this.uiCanvas = instantiate(uiPrefab);
            director.getScene().addChild(this.uiCanvas);
        } else {
            this.uiCanvas = uiPrefab;
        }

        this.uiCanvas.name = "$UICanvas$";
        director.addPersistRootNode(this.uiCanvas);

        this.waiting = this.uiCanvas.getChildByName("Waiting");

        this.panel = this.uiCanvas.getChildByName("Panel");
        this.panelMask = this.panel.getChildByName("mask");

        this.toast = this.uiCanvas.getChildByName("Toast");
        this.toastBg = this.toast.getChildByName("bg");
        this.toastLabel = this.toastBg.getChildByName("label");

        this.shareGuide = this.uiCanvas.getChildByName("ShareGuide");
        this.hideShareGuide();
        this.shareGuide.on(Button.EventType.CLICK, this.hideShareGuide, this);

        this.waiting.active = false;
        this.toast.active = false;

        this.globalDisableTouch = this.uiCanvas.getChildByName("globalDisableTouch");
        this.globalDisableTouch.active = false;
    }

    /********* 全局禁止点击 *********/
    globalDisableTouch: Node = null;

    showGlobalDisable(guideTxt = "") {
        this.globalDisableTouch.active = true;
    }

    hideGlobalDisable() {
        this.globalDisableTouch.active = false;
    }

    /********* Share Guide *********/

    shareGuide: Node = null;

    showShareGuide(guideTxt = "") {
        this.shareGuide.active = true;
        this.shareGuide.getChildByName("label")
            .getComponent(Label).string = guideTxt;
    }

    hideShareGuide() {
        this.shareGuide.active = false;
    }

    /********* Share Guide *********/

    /********* Scene *********/

    static async changeScene(cls: typeof Scene, data: any = {}) {
        await UIMgr.ins.changeScene(cls, data);
    }

    static async backScene(cls: typeof Scene, data: any = {}) {
        await UIMgr.ins.backScene(data);
    }

    sceneStack: (typeof Scene)[] = [];

    async changeScene(cls: typeof Scene, data: any = {}) {
        const { skin, bundle = skin } = cls;

        const waitPs = [];

        waitPs.push(RES.loadBundle(bundle));

        this.showWaiting();
        await Promise.all(waitPs);

        this.sceneStack.push(cls);

        director.loadScene(
            skin,
            (err, scene) => {
                const ctrl = scene.getComponentInChildren(cls);
                ctrl && (ctrl.data = data);
                this.hideWaiting();
            },
            () => {
            }
        );
    }

    async backScene(data: any = {}) {
        if (this.sceneStack.length <= 1) {
            return;
        }
        this.sceneStack.pop();
        const cls = this.sceneStack.pop();
        await this.changeScene(cls, data);
    }

    /********* Scene *********/


    /********* Panel *********/

    panel: Node;
    panelMask: Node;

    panelStack: any[] = [];
    curPanel: {
        cls: any,
        data: any,
        node: Node,
        showMask: boolean,
    } = null;

    async showPanel(cls: typeof Panel, data = {}, showMask = true) {
        const { skin, bundle = skin } = cls;

        const loadPs = [];

        let assetBundle = assetManager.getBundle(bundle);
        if (!assetBundle) {
            assetBundle = await RES.loadBundle(bundle);
        }

        loadPs.push(
            new Promise((resolve) => {
                assetBundle.load(skin, Prefab, (err, asset: Prefab) => {
                    if (err) {
                        console.warn(`资源 ${skin} 加载失败:`, err);
                        resolve(null);
                    } else if (!asset) {
                        resolve(null);
                    } else {
                        resolve(asset);
                    }
                });
            })
        );

        this.showWaiting();

        const resArr = await Promise.all(loadPs);

        this.hideWaiting();

        // 当前弹窗处理
        if (this.curPanel) {
            this.curPanel.node.active = false;
            this.panelStack.push(this.curPanel);
        }

        this.panelMask.active = true;
        if (showMask) {
            this.panelMask.getComponent(UIOpacity).opacity = 255 * 0.85;
        } else {
            this.panelMask.getComponent(UIOpacity).opacity = 0;
        }

        const panel = instantiate(resArr[0]);
        let ctrl: Panel = panel.getComponent(cls);

        // 2023/12/22 如果没有这个脚本，就直接添加
        if (!ctrl) {
            ctrl = panel.addComponent(cls);
        }

        this.panel.active = true;
        this.panel.addChild(panel);
        panel.layer = this.panel.layer;

        ctrl.data = data;
        ctrl.onShow();
        this.curPanel = {
            cls, data, showMask, node: panel
        };

        return ctrl;

    }

    hidePanel() {
        if (!this.curPanel) return;
        const { node: currPanelNode } = this.curPanel;

        currPanelNode.destroy();
        this.panel.removeChild(currPanelNode);

        this.panel.active = false;
        this.curPanel = null;

        this.curPanel = this.panelStack.pop();
        if (!!this.curPanel) {
            const { node, showMask } = this.curPanel;

            node.active = true;
            if (showMask) {
                this.panel.active = true;
                this.panelMask.getComponent(UIOpacity).opacity = 255 * 0.85;
            }
        }

    }

    hideAllPanel() {
        console.log("执行了");
        for (let i = 0; i < this.panelStack.length; i++) {
            this.panel.removeChild(this.panelStack[i].node);
            this.panelStack[i].node.destroy();
        }
        this.panelStack = [];
        this.hidePanel();
        this.panelMask.active = false;
        this.curPanel = null;
    }

    /********* Panel *********/


    /********* Toast *********/
    toast: Node;
    toastBg: Node;
    toastLabel: Node;

    static showToast(content: string, mask: boolean = false) {
        UIMgr.ins.showToast(content, mask);
    }

    static hideToast() {
        UIMgr.ins.hideToast();
    }

    showToast(content: string, mask: boolean = false) {
        const toastMask = this.toast.getChildByName("mask");
        const uiOpacity = this.toast.getComponent(UIOpacity);

        this.toastLabel.getComponent(Label).string = content.toString();

        this.toast.active = true;
        toastMask.active = mask;

        tween(uiOpacity).stop()
            .to(0.25, { opacity: 255 })
            .delay(1.7)
            .to(0.25, { opacity: 0 })
            .call(() => this.hideToast())
            .start();
    }

    hideToast() {
        this.toast.active = false;
        tween(this.toast).stop();
    }

    /********* Toast *********/


    /********* Waiting *********/
    waiting: Node;

    static showWaiting(mask: boolean = true) {
        UIMgr.ins.showWaiting(mask);
    }

    static hideWaiting() {
        UIMgr.ins.hideWaiting();
    }

    showWaiting(mask: boolean = true) {
        const waitingRot = this.waiting.getChildByName("waitingRot");
        const waitingMask = this.waiting.getChildByName("mask");
        this.waiting.active = true;
        waitingMask.active = mask;

        tween(waitingRot)
            .repeatForever(
                tween(waitingRot).by(1, { angle: 360 })
            )
            .start();
    }

    hideWaiting() {
        const waitingRot = this.waiting.getChildByName("waitingRot");

        this.waiting.active = false;
        tween(waitingRot).stop();
    }

    /********* Waiting *********/

}
