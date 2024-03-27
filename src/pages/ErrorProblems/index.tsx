import { Divider, FloatButton, List, Skeleton } from 'antd';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams, history } from 'umi';
import Problem, { Question } from '@/pages/components/Problem';
import { LogoutOutlined } from '@ant-design/icons';

const level0Data: Question[] = require('@/database/站务员岗位必知必会理论考试试题.json');
const level1Data: Question[] = require('@/database/值班员岗位必知必会理论考试.json');
const level2Data: Question[] = require('@/database/值班站长岗位必知必会理论考试试题.json');

const pageSize = 20; // Number of items to load per page

const ErrorProblems = () => {
  const { paper } = useParams();
  const database: { [key: string]: any } = {
    'b2a98ad3-d1b8-4af2-91cb-74cecde26f50': level0Data,
    'b3d7346a-4110-4f57-a59f-d7e5e7baf448': level1Data,
    '70d77dc3-ed2b-4f81-b17e-e6bc588a8eeb': level2Data,
  };
  const data = database[paper!];
  const paperStorage = localStorage.getItem(paper!);
  const errorIdArray = paperStorage ? JSON.parse(paperStorage!).errorRecord : [];
  const filteredData = data.filter(d => errorIdArray.includes(d.id));

  const [items, setItems] = useState<Question[]>(filteredData.slice(0, pageSize)); // Specify the type
  const [hasMore, setHasMore] = useState<boolean>(filteredData.length > pageSize);

  const fetchMoreData = () => {
    setTimeout(() => {
      const currentLength = items.length;
      const newItems = filteredData.slice(currentLength, currentLength + pageSize);
      setItems([...items, ...newItems]);
      setHasMore(items.length < filteredData.length);
    }, 800);
  };

  const handleClick = () => {
    history.push({
      pathname: '/ExamPapers',
    });
  };

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 'calc(100vh - 40px)',
        overflow: 'auto',
      }}
    >
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<Skeleton active />}
        endMessage={<Divider plain>题都被你刷完啦！</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={items}
          renderItem={(item: Question, index) => (
            <List.Item key={item.id} style={{ width: '100%', padding: 6 }}>
              <Problem item={item} sort={index + 1} paper={paper!} />
            </List.Item>
          )}
          locale={{
            emptyText: (<span></span>)
          }}
        />
        <FloatButton
              tooltip={<span>重选题库</span>}
              onClick={handleClick}
              icon={<LogoutOutlined />}
            ></FloatButton>
      </InfiniteScroll>
    </div>
  );
};

export default ErrorProblems;
