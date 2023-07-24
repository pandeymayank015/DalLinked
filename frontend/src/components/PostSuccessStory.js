import React, { useEffect, useState } from "react";
import profilePhoto from "./../images/profile.jpg";
import "./../styles/PostSuccessStory.css";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { BiSend } from "react-icons/bi";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "axios";
function getPostingDate() {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Months are zero-based
  const year = currentDate.getFullYear();

  // Pad single-digit day and month with leading zero if needed
  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${year}`;
}

function PostSuccessStory({ onStoryUpdate }) {
  const [jobSector, setJobSector] = useState("None");
  const [storyComments, setStoryComments] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [jobSectorsPost, setJobSectorsPost] = useState([]);

  const handleJobSectorChange = (eventKey) => {
    console.log(eventKey);
    const selectedSector = jobSectorsPost.find((jsp) => jsp._id === eventKey);

    if (selectedSector) {
      setJobSector(selectedSector.name);
      validateForm(selectedSector.name, storyComments);
    }
  };

  const handleStoryCommentsChange = (event) => {
    const comments = event.target.value;
    setStoryComments(comments);
    validateForm(jobSector, comments);
  };

  const validateForm = (selectedSector, comments) => {
    const isValid = selectedSector !== "None" && comments.trim() !== "";
    setIsFormValid(isValid);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3003/jobSectors")
      .then((res) => {
        setJobSectorsPost(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSendClick = async () => {
    if (isFormValid) {
      const newSuccessStory = {
        username: "JohnDoe",
        userId: 12345,
        creationDate: new Date(),
        jobSector: jobSector,
        message: storyComments,
        likes: [],
      };

      await axios
        .post("http://localhost:3003/successStory", newSuccessStory)
        .then((res) => console.log(res))
        .catch((err) => {
          console.log("error:" + err);
        });

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Success Story posted successfully.",
        showConfirmButton: false,
        timer: 2000,
      });

      onStoryUpdate(newSuccessStory);
      setStoryComments("");
      setJobSector("none");
    } else {
      Swal.fire(
        "Please provide your story details and the job Sector before sending."
      );
    }
  };

  return (
    <div className="container-fluid" style={{ display: "flex" }}>
      <img src={profilePhoto} className="postProfileImage" />
      <div className="storyDetails">
        <FloatingLabel controlId="story" label="Your Story..">
          <Form.Control
            as="textarea"
            placeholder="Write your story here"
            style={{ height: "8em" }}
            value={storyComments}
            onChange={handleStoryCommentsChange}
          />
        </FloatingLabel>
        <div className="postBottom">
          <DropdownButton
            id="dropdown-basic-button"
            title={jobSector}
            style={{ display: "inline", paddingTop: "1.2%" }}
            onSelect={handleJobSectorChange}
          >
            {jobSectorsPost.map((jsp) => (
              <Dropdown.Item key={jsp._id} eventKey={jsp._id}>
                {jsp.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>

          <Button variant="secondary" size="sm" onClick={handleSendClick}>
            <BiSend className="sendIcon" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostSuccessStory;