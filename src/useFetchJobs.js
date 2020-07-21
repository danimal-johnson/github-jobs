import { useReducer, useEffect } from 'react';

const ACTIONS = {
  MAKE_REQUEST: 'MAKE_REQUEST',
  GET_DATA: 'GET_DATA',
  ERROR: 'ERROR'
}

function reducer(state, action) {
  //action.payload.x
  switch(action.type) {
    case ACTIONS.MAKE_REQUEST:
      return { loading: true, jobs: [] };
    case ACTIONS.GET_DATA:
      return { ...state, loading: false, jobs: action.payload.jobs };
    case ACTIONS.ERROR:
      return { ...state, loading: false, error: action.payload.error, jobs: [] };
    default:
      return state;
  }
}

export default function useFetchJobs(params, page) {
  const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true })

  useEffect(() => {
    dispatch({ type: ACTIONS.MAKE_REQUEST });
  }, [params, page])

  return {
    jobs: ["woot", "doot", "shaboot"],
    loading: true,
    error: false
  }

}