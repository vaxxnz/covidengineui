import { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import {
  API_URL,
  LOI,
} from "./App";
import "./App.css";

const sessionUserId = getSessionUserId();

function createSessionUserId() {
  function randNum() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] + "";
  }
  function getRandStr() {
    // 256 bit of entropy
    return btoa(
      randNum() +
        randNum() +
        randNum() +
        randNum() +
        randNum() +
        randNum() +
        randNum() +
        randNum()
    );
  }
  const randStr = getRandStr();
  localStorage.setItem("sessionUserId", randStr);
  return randStr;
}

export function getSessionUserId() {
  const tmp = localStorage.getItem("sessionUserId");
  return tmp ? tmp : createSessionUserId();
}

export default function CSVUpload() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lois, setLois] = useState(false);
  const history = useHistory()

  const changeHandler = (event: any) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {
    setLoading(true);
    const formData = new FormData();

    formData.append("csv", selectedFile);
    formData.append("sessionUserId", sessionUserId);

    fetch(`${API_URL}/uploadcsv`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        saveLois(result.lois);
        setLois(result.lois);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error:", error);
      });
  };
  if (lois) {
    return (
      <Redirect
        to={{
          pathname: "/reconcile",
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="App">
        <section className="container-small2">
          <h1>Processing...</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="App">
      <section className="container-small3">
        <h1>Upload a CSV</h1>
        <div className="hr" />
        <aside>
          Only ANZ and BNZ accounts are supported. <a href="/demo.csv" download="demo.csv">Demo data csv</a>.
          <br />
          <br />
        </aside>

        <label className="upload-primary">
          <p>Upload CSV</p>
          <input type="file" name="file" onChange={changeHandler} />
        </label>
        <div>
          <button
            className="primary"
            onClick={handleSubmission}
            disabled={!isFilePicked}
          >
            Submit
          </button>
        </div>
        <button style={{ margin: "1rem 0 0 0" }} className="secondary" onClick={() => history.goBack()}>
          Back
        </button>
      </section>
    </div>
  );
}

function saveLois(lois: LOI[]) {
  localStorage.setItem("lois", JSON.stringify(lois));
}
