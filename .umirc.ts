import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    {
      path: '/',
      redirect: '/ExamPapers'
    },
    {
      path: "/",
      component: "Layout",
      routes: [
        {
          path: "/ExamPapers",
          component: "ExamPapers",
          metaData: {
            title: "题库",
          },
        },
        {
          path: "/ErrorProblems/:paper",
          component: "ErrorProblems",
          metaData: {
            title: "错题集",
          }
        },
        {
          path: "StartAnswering/:paper",
          component: "StartAnswering",
          metaData: {
            title: "答题",
          }
        },
      ],
    },
  ],
  npmClient: 'pnpm',
  mfsu: false,
});
