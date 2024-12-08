import React, { useState } from "react";
import FileUpload from "./FileUpload";
import Child1 from "./Child1";

function App() {
  const [data, setData] = useState([]);

  const handleDataUpload = (parsedData) => {
    setData(parsedData);
  };

  return (
    <div>
      <FileUpload set_data={handleDataUpload} />
      {data.length > 0 && <Child1 data={data} />}
    </div>
  );
}

export default App;
