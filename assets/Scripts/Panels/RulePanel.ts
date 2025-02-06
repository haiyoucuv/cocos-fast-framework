import Panel from "db://assets/core/ui/module/Panel";
import { _decorator, Button, RichText, UITransform, Node } from "cc";
import store from "../store/store";
import { observer, render } from "db://assets/core/mobx/decorators";

const { ccclass, property } = _decorator;

@observer
@ccclass('RulePanel')
export default class RulePanel extends Panel {

  static bundle = "RulePanel";
  static skin = "RulePanel";

  @property(Node) closeBtn: Node = null;
  @property(Node) ruleNode: Node = null;
  @property(Node) content: Node = null;
  

  async onLoad() {
    await store.updateRule()
    this.closeBtn.on(Button.EventType.CLICK, this.clickClose);
  }

  @render
  render() {
    // const { success, data } = await sendWebNet(WebNetName.projectRule);
    // if (!success) return
    this.setRuleTxt(store.ruleInfo);
  }

  clickClose = () => {
    this.hidePanel();
  }

  setRuleTxt(txt: string) {

    // const ruleNode = this.view['ScrollView/view/content/ruleTxt'];
    const ruleTxt = this.ruleNode.getComponent(RichText);
    // const content = this.view['ScrollView/view/content'];
    ruleTxt.maxWidth = this.content.getComponent(UITransform).width;

    this.scheduleOnce(() => {
        ruleTxt.string = txt.replace(/<p\b.*?(?:\>|\/>)/gi,"").replace(/<\/p\>/gi,"<br/>");
        this.content.getComponent(UITransform).height = this.ruleNode.getComponent(UITransform).height;
    }, 0.5);


  }
}
