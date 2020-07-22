import { useReducer, useEffect } from 'react';
import axios from 'axios';

const ACTIONS = {
  MAKE_REQUEST: 'MAKE_REQUEST',
  GET_DATA: 'GET_DATA',
  ERROR: 'ERROR',
  UPDATE_HAS_NEXT_PAGE: 'UPDATE_HAS_NEXT_PAGE'
}


// const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json';
// const BASE_URL = 'https://jobs.github.com/positions.json';

// == New CORS workaround: https://www.npmjs.com/package/local-cors-proxy ==
// Use the following with lcp --proxyUrl https://jobs.github.com
const BASE_URL = 'http://localhost:8010/proxy/positions.json';

function reducer(state, action) {
  //action.payload.x
  switch(action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] };
    case ACTIONS.UPDATE_HAS_NEXT_PAGE:
      return { ...state, hasNextPage: action.payload.hasNextPage };
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true })

  useEffect(() => {
    const cancelToken1 = axios.CancelToken.source();
    dispatch({ type: ACTIONS.MAKE_REQUEST });

    // Get the current page of jobs.
    axios.get(BASE_URL, {
      cancelToken: cancelToken1.token,
      params: { markdown: true, page: page, ...params }
    }).then( res => {
      dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data }}) 
    }).catch( e => {
      if (axios.isCancel(e)) return;
      dispatch({type: ACTIONS.ERROR, payload: { error: e }})
    })

    // Check to see if there is one more page after this one.
    const cancelToken2 = axios.CancelToken.source();
    axios.get(BASE_URL, {
      cancelToken: cancelToken2.token,
      params: { markdown: false, page: page + 1, ...params }
    }).then( res => {
      dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: {
        hasNextPage: res.data.length !== 0 }}) 
    }).catch( e => {
      if (axios.isCancel(e)) return;
      dispatch({type: ACTIONS.ERROR, payload: { error: e }})
    })

    return () => { // Cleanup function
      cancelToken1.cancel();
      cancelToken2.cancel();
    }
  }, [params, page]);

  return state;

}