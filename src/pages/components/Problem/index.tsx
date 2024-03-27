import { Button, Checkbox, Radio, Space, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'umi';
import './index.less';

type ProblemProps = {
  item: Question;
  sort: string | number;
  paper: string;
};

// 定义问题类型
type QuestionType = '单选' | '多选' | '判断题';

// 定义问题对象的类型
export type Question = {
  questionType: QuestionType;
  questionTitle: string;
  answer: string;
  optionA?: string | number;
  optionB?: string | number;
  optionC?: string | number;
  optionD?: string | number;
  answerAnalysis?: string;
  answerAnalysis_1?: string;
  difficulty?: string;
  regulation?: string;
  id: string;
};

const Problem: React.FC<ProblemProps> = (props) => {
  const { item, sort, paper } = props;
  const { pathname } = useLocation();
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const recordLabAndQuestion = () => {
    const existPaper = localStorage.getItem(paper);
    let parsedData;

    if (existPaper) {
      parsedData = JSON.parse(existPaper);
      parsedData.currentQuestion = item.id;
    } else {
      parsedData = {
        currentQuestion: item.id,
        questionRecord: [],
      };
    }

    if (!parsedData.questionRecord) {
      parsedData.questionRecord = [];
    }

    const existingRecordIndex = parsedData.questionRecord.findIndex(
      (r) => r.id === item.id,
    );
    if (existingRecordIndex !== -1) {
      parsedData.questionRecord[existingRecordIndex] = {
        id: item.id,
        selectedAnswers,
        submitted,
        showAnalysis,
      };
    } else {
      parsedData.questionRecord.push({
        id: item.id,
        selectedAnswers,
        submitted,
        showAnalysis,
      });
    }

    localStorage.setItem(paper, JSON.stringify(parsedData));
  };

  const handleSelection = (value: string) => {
    setSelectedAnswers([value]);
    if (item.questionType === '单选' || item.questionType === '判断题') {
      setSubmitted(true);
      if (value === item.answer) {
        message.success('回答正确！');
      } else {
        message.error('回答错误！');
        setShowAnalysis(true);
        handleAnswerWrong();
      }
    }
    recordLabAndQuestion();
  };

  const handleSubmit = () => {
    if (item.questionType === '多选') {
      if (
        selectedAnswers.sort().join('') ===
        item.answer.split(';').sort().join('')
      ) {
        message.success('回答正确！');
      } else {
        message.error('回答错误！');
        setShowAnalysis(true);
        handleAnswerWrong();
      }
    }
    setSubmitted(true);
    recordLabAndQuestion();
  };

  const handleAnswerWrong = () => {
    const existPaper = localStorage.getItem(paper);
    if (existPaper) {
      const parsedData = JSON.parse(existPaper);
      if (!parsedData.errorRecord) {
        parsedData.errorRecord = [];
      }

      // 添加新的错误项的id
      parsedData.errorRecord = Array.from(
        new Set([...parsedData.errorRecord, item.id]),
      );

      // 保存更新后的errorRecord回localStorage
      localStorage.setItem(paper, JSON.stringify(parsedData));
    }
  };

  const handleAnswerCorrect = () => {
    const paperExam = localStorage.getItem(paper!);
    if (paperExam) {
      const temp = JSON.parse(paperExam);
      const { errorRecord } = temp;
      if (errorRecord?.includes(item.id)) {
        const delIndex = errorRecord.findIndex((r) => r === item.id);
        if (delIndex !== -1) {
          errorRecord.splice(delIndex, 1);
          localStorage.setItem(paper, JSON.stringify(temp));
        }
      }
    }
  };

  useEffect(() => {
    const splitPathName = pathname.split('/');
    if (!splitPathName.includes('ErrorProblems')) {
      if (submitted) {
        recordLabAndQuestion();
        if (showAnalysis) {
          handleAnswerWrong();
        } else {
          handleAnswerCorrect();
        }
      }
    }
  }, [submitted, showAnalysis, pathname]);

  useEffect(() => {
    const splitPathName = pathname.split('/');
    if (!splitPathName.includes('ErrorProblems')) {
      const paperRecords = localStorage.getItem(paper!);
      if (paperRecords) {
        const temp = JSON.parse(paperRecords);
        const { questionRecord } = temp;
        const currentProblemRecord = questionRecord.find(
          (r) => r.id === item.id,
        );
        if (currentProblemRecord) {
          const { selectedAnswers, showAnalysis, submitted } =
            currentProblemRecord;
          setSelectedAnswers(selectedAnswers);
          setShowAnalysis(showAnalysis);
          setSubmitted(submitted);
        }
      }
    }
  }, [item, pathname]);

  const isCorrect = useMemo(() => {
    if (submitted) {
      if (showAnalysis) {
        return 'error';
      } else {
        return 'correct';
      }
    } else {
      return 'undone';
    }
  }, [submitted, showAnalysis]);

  return (
    <div className={isCorrect} id={item.id}>
      <h3
        style={{ marginBottom: '16px' }}
      >{`${sort} - ${item.questionType} - ${item.questionTitle}`}</h3>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        {item.questionType === '多选' ? (
          <>
            <Checkbox.Group
              style={{ width: '100%' }}
              disabled={submitted}
              onChange={(checkedValues: any[]) =>
                setSelectedAnswers(checkedValues)
              }
            >
              <Space direction="vertical" size={4}>
                <Checkbox value="A">
                  <h4>A. {item.optionA}</h4>
                </Checkbox>
                <Checkbox value="B">
                  <h4>B. {item.optionB}</h4>
                </Checkbox>
                <Checkbox value="C">
                  <h4>C. {item.optionC}</h4>
                </Checkbox>
                <Checkbox value="D">
                  <h4>D. {item.optionD}</h4>
                </Checkbox>
              </Space>
            </Checkbox.Group>
            {!submitted && (
              <Button type="primary" onClick={handleSubmit}>
                提交
              </Button>
            )}
            {showAnalysis && (
              <div>
                <p>正确答案：{item.answer}</p>
                <p>解析：{item.answerAnalysis}</p>
                {item.answerAnalysis_1 && <p>解析1：{item.answerAnalysis_1}</p>}
                <p>规章：{item.regulation}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <Radio.Group
              style={{ width: '100%' }}
              disabled={submitted}
              onChange={({ target: { value } }) => handleSelection(value)}
            >
              <Space direction="vertical" size={4}>
                <Radio value="A">
                  <h4>A. {item.optionA}</h4>
                </Radio>
                <Radio value="B">
                  <h4>B. {item.optionB}</h4>
                </Radio>
                {item.optionC && (
                  <Radio value="C">
                    <h4>C. {item.optionC}</h4>
                  </Radio>
                )}
                {item.optionD && (
                  <Radio value="D">
                    <h4>D. {item.optionD}</h4>
                  </Radio>
                )}
              </Space>
            </Radio.Group>
            {showAnalysis && (
              <div>
                <p>正确答案：{item.answer}</p>
                <p>解析：{item.answerAnalysis}</p>
                {item.answerAnalysis_1 && <p>解析1：{item.answerAnalysis_1}</p>}
                <p>规章：{item.regulation}</p>
              </div>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default Problem;
