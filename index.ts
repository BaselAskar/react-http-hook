import {useState,useCallback,useEffect} from 'react';
import { CreateHttp, HttpResponse, RequestConfi, RequestParams } from './types/react-http-hook';

const APPLICATION_JSON = 'application/json';
const CONTENT_TYPE = 'Content-Type';


  const defaultCreateHttp: CreateHttp = {
    baseUrl: '',
    defaultApplyError:(error:any) => {},
    getToken:() => undefined,
    refreshToken:(res:Response) => {},
    logout:() => {},
  }




  const defaultRequestConfig:RequestConfi<any> = {
      url: '',
      method:'get',
      header: new Map<string,string>(),
      auth: false,
      state: 'one',
      applyData: (response:HttpResponse<any>) => {throw 'you have to provide applyData property ...'},
      dependinces: [],  
  }


  const defaultRequestParams:RequestParams = {
      query: {},
      pathParams: [],
      body: null,
    }





  export const createHttpHook = function(createHttpParams:CreateHttp = defaultCreateHttp){

    createHttpParams = {...defaultCreateHttp,...createHttpParams};

    const  {baseUrl,defaultApplyError,getToken,refreshToken,logout} = createHttpParams;

    return <TResut = any> (reqConfig:RequestConfi<TResut> = defaultRequestConfig) => {

    if (!reqConfig.applyError) reqConfig.applyError = defaultApplyError;

    reqConfig = {...defaultRequestConfig,...reqConfig};

    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [error,setError] = useState<any>(null);


    const sendRequest = useCallback(async (params: RequestParams = defaultRequestParams) => {

      params = {...defaultRequestParams,...params};
      if (isLoading && reqConfig.state === 'one') return;

      setIsLoading(true);
      setError(null);

      const variablesInUrl = (params?.pathParams && params.pathParams?.length > 0) ? '/' + params.pathParams.join('/') : '';

      let queryParams = '';

      if (params?.query && Object.entries(params.query).length > 0){
        queryParams = '?';
        
        Object.entries(params.query).forEach(item => {
          queryParams += `${item[0]}=${item[1]}&`
        });

        queryParams.slice(-1);
      }

        const reqHeader: HeadersInit = new Headers();

        (params?.body && !(params.body instanceof FormData)) && reqHeader.append(CONTENT_TYPE,APPLICATION_JSON);

        if (reqConfig.header){
          reqConfig.header.forEach((value:string,key:string) => {
            reqHeader.append(key,value);
          });
        }

        if (reqConfig.auth){
          const jwt = getToken();
          if (!jwt) logout();
          reqHeader.append('Authorization', `Bearer ${jwt}`);
        }


        let bodyBuilder: BodyInit | null | undefined;

        if (params.body){

          if (reqHeader.get(CONTENT_TYPE) === APPLICATION_JSON){
            bodyBuilder = JSON.stringify(params.body);
          }
          else if(params.body instanceof FormData){
            bodyBuilder = params.body
          }
        }

        try {
          const response = await fetch(baseUrl + reqConfig.url + variablesInUrl + queryParams,{
            method: reqConfig.method!.toUpperCase(),
            headers: reqHeader,
            body: bodyBuilder,
          });

          if (response.status === 403){
            logout();
          }


          if (response.status >= 400){
            throw await response.json();
          }

          if (reqConfig.auth){
            refreshToken(response);
          }



          let data:any;

          try{
            data = (await response.json()) as TResut;
          }catch(err){

            try{
              data = (await response.text()) as TResut;
            }
            catch(err2){
              data = undefined;
            }
          }

          const httpResponse:HttpResponse<TResut> = {
            data:data,
            headers: response.headers,
            status:response.status,
            statusText:response.statusText
          }

          reqConfig.applyData(httpResponse);

        }catch(error){
          setError(error);
        }finally {
          setIsLoading(false);
        }



      

    },[isLoading, reqConfig])


    useEffect(() =>{ 
      if (error)
        reqConfig.applyError!(error);
    },[error]);


    return {
      sendRequest,
      error,
      isLoading,
    }



  }
}





