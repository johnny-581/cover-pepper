// export type Letter = {
//     id: string;
//     title: string;
//     company: string;
//     position: string;
//     date: string;
//     contentLatex: string;
//     createdAt: string;
//     updatedAt: string;
// };

export type Letter = {
  id: string;
  templateId: string;
  date: string;
  body: string;
  jobInfo: {
    fileTitle: string;
    positionTitle: string;
    companyName: string;
    companyAddress: string;
    hiringManager: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type MonacoEditorProps = {
  letter: Letter;
  /** Pass the outer scroll container (the overflow-auto div). */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
};
