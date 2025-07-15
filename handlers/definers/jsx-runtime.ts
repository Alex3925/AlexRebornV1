import { FontSystem, UNIRedux } from "cassidy-styler";
const { fonts } = FontSystem;

type Props = { children?: any; [key: string]: string };

function pretendUsed<T extends any[]>(...items: T): T {
  return items;
}

export function jsx(tag: string, props: Props, key?: string): string {
  pretendUsed(key);
  return processChildren({ tag, props });
}

export function jsxs(tag: string, props: Props, key?: string): string {
  pretendUsed(key);
  return processChildren({ tag, props });
}

export function jsxDEV(tag: string, props: Props, key?: string): string {
  pretendUsed(key);
  return processChildren({ tag, props });
}

export const etcTagMappings = {
  br(text: string, node: VNode) {
    pretendUsed(text, node);
    return "\n";
  },
  standardLine(text: string, node: VNode) {
    pretendUsed(text, node);
    return `\n${UNIRedux.standardLine}\n`;
  },
  title(text: string, node: VNode) {
    const font = node?.props?.font ?? "bold";
    return `${fonts[font](text)}\n${UNIRedux.standardLine}\n`;
  },
  content(text: string, node: VNode) {
    const font = node?.props?.font ?? "fancy";
    return `${fonts[font](text)}`;
  },
};

interface VNode {
  tag?: string;
  props?: Props;
}

function processChildren(node: VNode): string {
  if (!node) {
    return "";
  }
  const children = node.props.children;

  const text = Array.isArray(children)
    ? children
        .map((child) =>
          typeof child === "string" ? child : processChildren(child)
        )
        .join("")
    : typeof children === "string"
    ? children
    : processChildren(children);
  if (!node.tag) {
    return text;
  }
  if (node.tag in etcTagMappings) {
    return etcTagMappings[node.tag](text, node);
  }
  const fontKey = node.tag.replace(/^f_/, "") as CassidySpectra.FontTypes;

  return fonts[fontKey]?.(text) ?? text;
}
