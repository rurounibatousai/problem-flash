import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import labList from '@/database/fileNames.json';
import { history } from 'umi';

interface DataType {
  labName: string;
  id: string;
  questionCount: number;
}


export default function ExamPapers() {
  const [tableData, setTableData] = useState<DataType[]>([]);
  
  const columns: ColumnsType<DataType> = [
    {
      title: '题库名称',
      dataIndex: 'labName',
      key: 'labName',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operator',
      key: 'operator',
      align: 'center',
      render: (value, record) => {
        return (
          <>
            <Button type='link' onClick={() => handleStartFlash(record, 'start')}>开刷</Button>
            <Button type='link' onClick={() => handleStartFlash(record, 'error')}>做错题</Button>
          </>
        )
      }
    }
  ];

  const handleStartFlash = useCallback((record: any, type: 'start' | 'error') => {
    history.push({
      pathname: `/${type === 'start' ? 'StartAnswering' : 'ErrorProblems'}/${record.id}`,
    })
  }, [columns]);

  useEffect(() => {
    setTableData(labList);
  })

  return <Table columns={columns} dataSource={tableData} rowKey={(record) => record.id} bordered />;
}
