import { UIMgr } from "./UIMgr";
import Scene from "./module/Scene";

export async function changeScene(cls: typeof Scene, data?: any) {
    await UIMgr.ins.changeScene(cls, data);
}

export async function showPanel(cls: any, data: any = {}, showMask: boolean = true) {
    await UIMgr.ins.showPanel(cls, data, showMask);
}

export function hidePanel() {
    UIMgr.ins.hidePanel();
}

export function hideAllPanel() {
    UIMgr.ins.hideAllPanel();
}

export function showWaiting(mask: boolean = true) {
    UIMgr.ins.showWaiting(mask);
}

export function hideWaiting() {
    UIMgr.ins.hideWaiting();
}

export function showToast(content: string, mask: boolean = false) {
    UIMgr.ins.showToast(content, mask);
}

export function hideToast() {
    UIMgr.ins.hideToast();
}

export function showShareGuide(guideTxt = "") {
    UIMgr.ins.showShareGuide(guideTxt);
}

export function hideShareGuide() {
    UIMgr.ins.hideShareGuide();
}

export function showGlobalDisable() {
    UIMgr.ins.showGlobalDisable();
}

export function hideGlobalDisable() {
    UIMgr.ins.hideGlobalDisable();
}
