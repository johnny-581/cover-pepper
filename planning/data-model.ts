type Letter = {
  id: string;
  templateId: string;
  date: string;
  body: string;
  metadata: {
    fileTitle: string;
    positionTitle: string;
    companyName: string;
    companyAddress: string;
    hiringManager: string;
  };
  createdAt: string;
  updatedAt: string;
};
