/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import React from 'react';

import electron from 'electron';

const devToolsNodeId = (url: string) =>
  `hermes-chromedevtools-out-of-react-node-${url.replace(/\W+/g, '-')}`;

// TODO: build abstractionf or this: T62306732
const TARGET_CONTAINER_ID = 'flipper-out-of-contents-container'; // should be a hook in the future

function createDevToolsNode(url: string): HTMLElement {
  const existing = findDevToolsNode(url);
  if (existing) {
    return existing;
  }

  // It is necessary to activate chrome devtools in electron
  electron.remote.getCurrentWindow().webContents.toggleDevTools();
  electron.remote.getCurrentWindow().webContents.closeDevTools();

  const wrapper = document.createElement('div');
  wrapper.id = devToolsNodeId(url);
  wrapper.style.height = '100%';
  wrapper.style.width = '100%';

  const iframe = document.createElement('webview');
  iframe.style.height = '100%';
  iframe.style.width = '100%';

  // // HACK: chrome-devtools:// is blocked by the sandbox but devtools:// isn't for some reason.
  iframe.src = url.replace(/^chrome-/, '');

  wrapper.appendChild(iframe);
  document.getElementById(TARGET_CONTAINER_ID)!.appendChild(wrapper);
  return wrapper;
}

function findDevToolsNode(url: string): HTMLElement | null {
  return document.querySelector('#' + devToolsNodeId(url));
}

function attachDevTools(devToolsNode: HTMLElement) {
  devToolsNode.style.display = 'block';
  document.getElementById(TARGET_CONTAINER_ID)!.style.display = 'block';
}

function detachDevTools(devToolsNode: HTMLElement | null) {
  document.getElementById(TARGET_CONTAINER_ID)!.style.display = 'none';

  if (devToolsNode) {
    devToolsNode.style.display = 'none';
  }
}

type ChromeDevToolsProps = {
  url: string;
};

export default class ChromeDevTools extends React.Component<
  ChromeDevToolsProps
> {
  createDevTools(url: string) {
    const devToolsNode = createDevToolsNode(url);
    attachDevTools(devToolsNode);
  }

  hideDevTools(_url: string) {
    detachDevTools(findDevToolsNode(this.props.url));
  }

  componentDidMount() {
    this.createDevTools(this.props.url);
  }

  componentWillUnmount() {
    this.hideDevTools(this.props.url);
  }

  componentDidUpdate(prevProps: ChromeDevToolsProps) {
    const oldUrl = prevProps.url;
    const newUrl = this.props.url;
    if (oldUrl != newUrl) {
      this.hideDevTools(oldUrl);
      this.createDevTools(newUrl);
    }
  }

  render() {
    return <div style={{height: 0}} />;
  }
}
