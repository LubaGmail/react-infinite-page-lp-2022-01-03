import * as React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';

const API_BASE = 'https://hn.algolia.com/api/v1/search';
const PARAM_PAGE = '?page=';

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA':
      // console.log(state)
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      // console.log(state)
      return {
        ...state,
        isLoading: false,
        isError: false,
        // payload: {list: result.data.hits, page: result.data.page}
        data:
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
  }
};

const App = () => {
  // state
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
    page: 0,
  });
  const [url, setUrl] = React.useState('');

  // io
  const getUrl = () => {
    return `${API_BASE}${PARAM_PAGE}${stories.page}`;
  };

  const getData = React.useCallback(async () => {
    const url = getUrl();
    // console.log('url', url)
    dispatchStories({
      type: 'LOAD_DATA',
    });
    try {
      const result = await axios.get(url);
      // console.log(result.data.hits);
      dispatchStories({
        type: 'FETCH_SUCCESS',
        payload: {
          list: result.data.hits,
          page: result.data.page,
        },
      });
    } catch {}
  }, [url]);

  // useEffect
  React.useEffect(() => {
    getData();
    //use fx whenever it could potentially close over state
  }, [getData]);

  // handlers
  const handleMore = () => {
    const url = getUrl();
    setUrl(url);
    stories.page += 1;
  };

  return (
    <>
      <h3>Infinite pagination</h3>
      <button type="button" onClick={handleMore}>
        More
      </button>
      &nbsp; {url}
      <hr />
      {stories.isLoading ? (
        <p>Loading...</p>
      ) : stories.isError ? (
        <p>Some Error</p>
      ) : (
        <List list={stories.data} page={stories.page} />
      )}
    </>
  );
};

const List = ({ list, page }) => {
  // console.log(list.length)
  let last = list.length - 1;

  return (
    <>
      <p>
        <span>
          <b># of records: </b> {list.length}
        </span>
        &nbsp; | &nbsp;
        <span>
          <b>Last record shown: </b>"{list[last]?.title?.substr(0, 20)}"
        </span>
      </p>

      {list.map((el, i) => (
        <li key={i}>
          {i}:&nbsp; {el.title?.substr(0, 20)}
        </li>
      ))}
    </>
  );
};

export default App;
