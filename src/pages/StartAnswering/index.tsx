import Problem, { Question } from '@/pages/components/Problem';
import {
  CloseSquareOutlined,
  LogoutOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { Divider, FloatButton, List, Skeleton, Spin } from 'antd'; // Import Spin from 'antd'
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { history, useParams } from 'umi';
const level0Data: Question[] = require('@/database/站务员岗位必知必会理论考试试题.json');
const level1Data: Question[] = require('@/database/值班员岗位必知必会理论考试.json');
const level2Data: Question[] = require('@/database/值班站长岗位必知必会理论考试试题.json');

const pageSize = 20; // Number of items to load per page

const ProblemList = () => {
  const { paper } = useParams();
  const database: { [key: string]: any } = {
    'b2a98ad3-d1b8-4af2-91cb-74cecde26f50': level0Data,
    'b3d7346a-4110-4f57-a59f-d7e5e7baf448': level1Data,
    '70d77dc3-ed2b-4f81-b17e-e6bc588a8eeb': level2Data,
  };
  const data = database[paper!];
  const [items, setItems] = useState<Question[]>(data.slice(0, pageSize)); // Specify the type
  const [hasMore, setHasMore] = useState<boolean>(data.length > pageSize);
  const [fetching, setFetching] = useState<boolean>(false);

  const startRef = useRef<number>(0);

  const fetchMoreData = (isReset = false) => {
    setTimeout(() => {
      const currentStart = isReset ? 0 : startRef.current + pageSize;
      const newItems = data.slice(currentStart, currentStart + pageSize);
      setItems((prevItems) => isReset ? newItems : [...prevItems, ...newItems]);
      startRef.current = currentStart;
      setHasMore(currentStart + pageSize < data.length); // Update hasMore
    }, 800);
  };

  const handleClick = () => {
    history.push({
      pathname: '/ExamPapers',
    });
  };

  const navigateToErrorExam = () => {
    history.push({
      pathname: `/ErrorProblems/${paper}`,
    });
  };

  const resetCurrentExam = () => {
    localStorage.removeItem(paper!);
    setItems([]);
    fetchMoreData(true); // Pass true to indicate reset
  };

  useEffect(() => {
    const paperExam = localStorage.getItem(paper!);
    setFetching(true);

    const fetchDom = () => {
      if (paperExam) {
        const temp = JSON.parse(paperExam);
        const { currentQuestion } = temp;
        const currQuestionIndex = data.findIndex(
          (r: { id: any }) => r.id === currentQuestion,
        );
        if (currQuestionIndex !== -1) {
          const listItem = document.getElementById(currentQuestion);
          if (listItem) {
            listItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setFetching(false);
            return;
          } else {
            setTimeout(() => {
              fetchMoreData();
              fetchDom(); // Recursive call
            }, 800);
          }
        }
      } else {
        setFetching(false);
      }

      // If the DOM element is not found or paperExam is not available, fetch more data recursively
    };

    fetchDom();
  }, [paper]); // Add paper as a dependency to re-run the effect when paper changes

  return (
    <Spin spinning={fetching}>
      <div
        id="scrollableDiv"
        style={{
          height: 'calc(100vh - 40px)',
          overflow: 'auto',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Spin spinning={items.length === 0} size="large" />
          </div>
        ) : null}

        {items.length !== 0 ? (
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
            />
            <FloatButton.Group>
              <FloatButton
                tooltip={<span>重选题库</span>}
                onClick={handleClick}
                icon={<LogoutOutlined />}
              ></FloatButton>
              <FloatButton
                tooltip={<span>做错题</span>}
                onClick={navigateToErrorExam}
                icon={<CloseSquareOutlined />}
              ></FloatButton>
              <FloatButton
                tooltip={<span>重置当前题库</span>}
                onClick={resetCurrentExam}
                icon={<RedoOutlined />}
              ></FloatButton>
              <FloatButton.BackTop
                tooltip={<span>回到顶部</span>}
                target={() => document.getElementById('scrollableDiv')!}
              />
            </FloatButton.Group>
          </InfiniteScroll>
        ) : null}
      </div>
    </Spin>
  );
};

export default ProblemList;
