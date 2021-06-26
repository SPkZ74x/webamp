import * as Utils from "../utils";
import UI_ROOT from "../UIRoot";
import GuiObj from "./GuiObj";
import SystemObject from "./SystemObject";
import { SkinContext } from "../types";

// http://wiki.winamp.com/wiki/XML_GUI_Objects#.3Cgroup.2F.3E
export default class Group extends GuiObj {
  _instanceId: string;
  _background: string;
  _desktopAlpha: boolean;
  _drawBackground: boolean;
  _minimumHeight: number;
  _maximumHeight: number;
  _minimumWidth: number;
  _maximumWidth: number;
  _systemObjects: SystemObject[] = [];
  _children: GuiObj[] = [];

  setXmlAttr(_key: string, value: string): boolean {
    const key = _key.toLowerCase();
    if (super.setXmlAttr(key, value)) {
      return true;
    }
    switch (key) {
      case "instance_id":
        this._instanceId = value;
        break;
      case "background":
        this._background = value;
        break;
      case "drawbackground":
        this._drawBackground = Utils.toBool(value);
        break;
      case "minimum_h":
        this._minimumHeight = Utils.num(value);
        break;
      case "minimum_w":
        this._minimumWidth = Utils.num(value);
        break;
      case "maximum_h":
        this._maximumHeight = Utils.num(value);
        break;
      case "maximum_w":
        this._maximumWidth = Utils.num(value);
        break;
      default:
        return false;
    }
    return true;
  }

  init(context: SkinContext) {
    for (const systemObject of this._systemObjects) {
      systemObject.init(context);
    }
    for (const child of this._children) {
      child.init(context);
    }
  }

  getId() {
    return this._instanceId || this._id;
  }

  addSystemObject(systemObj: SystemObject) {
    systemObj.setParentGroup(this);
    this._systemObjects.push(systemObj);
  }

  addChild(child: GuiObj) {
    this._children.push(child);
  }

  /* Required for Maki */

  getobject(objectId: string): GuiObj {
    const lower = objectId.toLowerCase();
    for (const obj of this._children) {
      if (obj.getId() === lower) {
        return obj;
      }
    }
    const foundIds = this._children.map((child) => child.getId()).join(", ");
    throw new Error(
      `Could not find an object with the id: "${objectId}" within object "${this.getId()}". Only found: ${foundIds}`
    );
  }

  draw() {
    super.draw();
    this._div.setAttribute("data-obj-name", "Group");
    this._div.style.height = Utils.px(this._maximumHeight);
    this._div.style.width = Utils.px(this._maximumWidth);
    if (this._background != null && this._drawBackground) {
      const bitmap = UI_ROOT.getBitmap(this._background);
      this._div.style.background = bitmap.getBackgrondCSSAttribute();
    }
    for (const child of this._children) {
      child.draw();
      this._div.appendChild(child.getDiv());
    }
  }
}
