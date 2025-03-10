# React Native Mobile SDK

## Overview

The React Native Mobile SDK is a library that allows you to embed a Thoughtspot component in your mobile application.


## Quick Start

The ThoughtSpot Embed SDK allows you to embed the ThoughtSpot liveboard embed experience.

### Embedded Search

```js
// NPM
import { LiveboardEmbed, AuthType, init } from '@thoughtspot/react-native-mobile-sdk';

init({
    thoughtSpotHost: '<%=tshost%>',
    authType: AuthType.TrustedAuthTokenCookieless,
    getAuthToken: async () => Token,
});

const LiveboardEmbedView = () => {

    return (
        <LiveboardEmbed
            ref = {webViewRef}
            liveboardId={liveboardId}
        />
    )
}
```


## Contributing

### Local dev server

How to build local sdk pacakge and test.

```
$ npm run build
```

```
$ npm yalc publish
```

Use this SDK package in your project using 

```
$ npm yalc add react-native-mobile-sdk
```
Once added this will link your sdk.

<br/>
<br/>

React-Native-Mobile-SDK, © ThoughtSpot, Inc. 2025