import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { EmbedBridge } from "./event-bridge";
import { embedConfigCache } from "./init";
import * as Constants from './constants';
import { MSG_TYPE, DEFAULT_WEBVIEW_CONFIG } from './constants';
import { ERROR_MESSAGE, notifyErrorSDK } from "./utils";
import { ViewConfig, EmbedEventHandlers, EmbedEvent } from "./types";
import useDeepCompareEffect from "use-deep-compare-effect"; 

interface BaseEmbedProps extends ViewConfig, EmbedEventHandlers {
  typeofEmbed: string;
  onErrorSDK?: (error: Error) => void;
  [key: string]: any;
}

export interface TSEmbedRef {
  trigger: (hostEventName: string, payload?: any) => Promise<any>;
}

export const BaseEmbed = forwardRef<TSEmbedRef, BaseEmbedProps>(
  (props: any, ref: any) => {
    const webViewRef = useRef<WebView>(null);
    const [embedBridge, setEmbedBridge] = React.useState<EmbedBridge | null>(null);
    const [vercelShellLoaded, setVercelShellLoaded] = React.useState(false);
    const [viewConfig, setViewConfig] = React.useState<Record<string, any>>({});
    const [pendingHandlers, setPendingHandlers] = React.useState<Array<[string, Function]>>([]);
    const [isWebViewReady, setIsWebViewReady] = React.useState(false);

    useDeepCompareEffect(() => {
      const newViewConfig: Record<string, any> = {};
      const newPendingHandlers: Array<[string, Function]> = [];

      Object.keys(props).forEach((key) => {
        if (key.startsWith("on")) {
          const eventName = key.substring(2);
          const embedEventName = EmbedEvent[eventName as keyof typeof EmbedEvent];
          newPendingHandlers.push([embedEventName, props[key]]);
        } else if (key !== 'embedType') {
          newViewConfig[key] = props[key];
        }
      });
      setPendingHandlers((prev: any) => [...prev, ...newPendingHandlers]);
      setViewConfig(newViewConfig);
    }, [props]);

    const sendConfigToShell = useCallback((bridge: EmbedBridge, config: Record<string, any>) => {
      if (!webViewRef.current || !vercelShellLoaded) {
        console.info("Waiting for Vercel shell to load...");
        return;
      }

      const initMsg = {
        type: MSG_TYPE.INIT,
        payload: embedConfigCache,
      };

      bridge.sendMessage(initMsg);

      const message = {
        type: MSG_TYPE.EMBED,
        embedType: props.embedType,
        viewConfig: config,
      };

      bridge.sendMessage(message);
    }, [props.embedType, vercelShellLoaded]);

    useDeepCompareEffect(() => { 
      if (embedBridge && vercelShellLoaded && isWebViewReady) {
        sendConfigToShell(embedBridge, viewConfig);
      }
    }, [viewConfig, embedBridge, vercelShellLoaded, isWebViewReady, sendConfigToShell]);

    useImperativeHandle(ref, () => ({
      trigger: (hostEventName: string, payload?: any) => {
        return embedBridge?.trigger(hostEventName, payload) || Promise.resolve(undefined);
      },
    }));

    const handleInitVercelShell = () => {
      setVercelShellLoaded(true);
      const newEmbedBridge = new EmbedBridge(webViewRef as any);
      setEmbedBridge(newEmbedBridge);

      pendingHandlers.forEach(([eventName, callback]) => {
        newEmbedBridge.registerEmbedEvent(eventName, callback);
      });
      setPendingHandlers([]);
      sendConfigToShell(newEmbedBridge, viewConfig);
    };

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === MSG_TYPE.INIT_VERCEL_SHELL) {
          handleInitVercelShell();
          setIsWebViewReady(true);
        }
        embedBridge?.handleMessage(msg);
      } catch (err) {
        notifyErrorSDK(err as Error, props.onErrorSDK, ERROR_MESSAGE.EVENT_ERROR);
      }
    };

    return (
      <WebView
        ref={webViewRef}
        testID={'test-webview'}
        source={{ uri: Constants.VERCEL_SHELL_URL }}
        onMessage={handleMessage}
        {...DEFAULT_WEBVIEW_CONFIG}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("HTTP error: ", nativeEvent);
        }}
        style={{ flex: 1 }}
      />
    );
  }
);