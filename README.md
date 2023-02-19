# React-http-hook
<p>use http react hook in react application</p>
 <br/>





## Installation
write this command line to install the package

```bash
npm install react-http-hook
```

## Useage
<p>this is an example to create http hook</p>

```typescript
import {createHttpHook} from 'react-http-hook'


export default const useHttp = createHttpHook({
  baseUrl:string,
  defaultApplyError:(error:any) => void,
  getToken:() => string,
  refreshToken:(response:Response) => void,
  logout:() => void
});

export default useHttp;
```
