
export interface CreateHttp{
  baseUrl:string,
  defaultApplyError:(error:any) => void,
  getToken:() => string | undefined,
  refreshToken:(respones:Response) => void,
  logout:() => void
}





export interface RequestConfi<TData> {
  url: string,
  method?: 'get' | 'post' | 'put' | 'delete',
  header?: Map<string,string>,
  auth?: boolean,
  state?: 'one' | 'multi',
  applyData : (reponse:HttpResponse<TData>) => void,
  dependinces?: any[],
  applyError?:(error:any) => void
}




export interface RequestParams {
  query?: Object,
  pathParams?: string[],
  body?: object | null
}


export interface HttpResponse<T> {
  data: T,
  status:number,
  statusText:string,
  headers: Headers
}
