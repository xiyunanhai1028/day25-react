/*
 * @Author: dfh
 * @Date: 2021-02-24 18:18:22
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-03 14:26:06
 * @Modified By: dfh
 * @FilePath: /day25-react/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

function useRequest(url) {
  const limit = 5;//每次请求的条数
  let [offset, setOffset] = React.useState(0);//偏移量
  let [data, setData] = React.useState([]);//真实数据
  function loadMore() {
    setData(null);
    fetch(`${url}?offset=${offset}&limit=${limit}`)
      .then(res => res.json())
      .then(pageData => {
        setData([...data, ...pageData]);
        setOffset(offset + pageData.length);
      })
  }

  React.useEffect(loadMore, []);
  return [data, loadMore]
}
function App() {
  const [list, loadMore] = useRequest('http://localhost:8000/api/users');

  if (list === null) {
    return <div>加载中。。。</div>
  }

  return <div>
    <ul>
      {list.map(item => <li key={item.id}>{item.id}---{item.name}</li>)}
    </ul>
    <button onClick={loadMore}>Add +1</button>
  </div>
}
ReactDOM.render(<App />, document.getElementById('root'));

