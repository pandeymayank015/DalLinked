import React, { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col, Dropdown, Pagination, Collapse } from "react-bootstrap";
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import "../styles/StudentListingsPage.css";
import axios from 'axios';
import { useAuthContext } from "../hooks/useAuthContext";

function StudentListingsPage({ employerId }) {

  const [students, setStudents] = useState([]);  
  const { user } = useAuthContext();
  const [selectedStatus, setSelectedStatus] = useState({}); // an object to store statuses for each student
  const [activePage, setActivePage] = useState(1); // New state for pagination
  const [expandedCards, setExpandedCards] = useState({}); // New state for expandable cards

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${backendUrl}/employeeJobs/getApplicantsByEmployeeid/${employerId}`, {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        })
        setStudents(response.data);
        const initialStatus = response.data.reduce((acc, curr) => ({ ...acc, [curr.studentId]: 'Applied' }), {});
        setSelectedStatus(initialStatus);
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };
    fetchStudents();
  }, [employerId]);

  const handleStatusUpdate = async (_id, newStatus, studentEmail) => {
    try {
      await axios.patch(
        `${backendUrl}/appliedJobs/updateStatusById/${_id}`,
        {
          id: _id,
          status: newStatus,
          studentEmail: studentEmail
        },
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        }
      );
  
      setStudents(prevStudents => {
        return prevStudents.map(student => {
          if (student._id === _id) {
            return { ...student, status: newStatus };
          }
          return student;
        });
      });
  
      console.log('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      console.log('An error occurred while updating the status.');
    }
  };
  

  
  

  const studentsPerPage = 3;
  const totalPages = Math.ceil(students.length / studentsPerPage);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const indexOfLastStudent = activePage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const toggleExpand = (index) => {
    setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };


  return (
    <Container>
      <Row>
        {currentStudents.map((student, idx) => (
          <Col key={idx} xs={12}>
            <Card className="mb-4 student-card p-3">
          <Card.Body>
            <Row className="align-items-center">
              <Col xs={12} sm={3} md={2}>
                <img
                  src={student.student?.profileImage || "https://via.placeholder.com/150"}
                  alt="Student Profile"
                  className="img-fluid rounded-circle profile-image mb-3 mb-sm-0"
                />
              </Col>

              <Col xs={12} sm={9} md={10}>
                <Row>
                  <Col>
                    <Card.Title>Name: {student.firstName} {student.lastName}</Card.Title>
                    <Card.Text>Applied For: {student.job.companyName}</Card.Text>
                    <Card.Text>Job sector: {student.job.jobSector}</Card.Text>
                    <Card.Text>Title: {student.job.title}</Card.Text>
                  </Col>
                  <Col xs="auto">
                    <Button variant="link" onClick={() => toggleExpand(idx)}>
                      {expandedCards[idx] ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </Col>
                </Row>
                <Collapse in={expandedCards[idx]}>
                  <div>
                    <Card.Text>Work Experience: {student.student.workExperience}</Card.Text>
                    <Card.Text>Education: {student.student.education}</Card.Text>
                    <Card.Text>Skills: {student.student.skills}</Card.Text>
                    <Card.Text>About: {student.student.about}</Card.Text>
                    <Card.Text>Work Style: {student.student.workStyle}</Card.Text>
                    <Card.Text>Contact: {student.student.contact}</Card.Text>
                  </div>
                </Collapse>
                <Row>
                  <Col md={12}>
                  </Col>
                </Row>
              </Col>
              <div className="button-container">
                <Button href={student.student.resume} variant="outline-primary" className="mr-2">Download Resume</Button>
                <div className="dropdown-button">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                    {student.status}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleStatusUpdate(student._id, 'InterviewScheduled', student.email)}>InterviewScheduled</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleStatusUpdate(student._id, 'Accepted', student.email)}>Accepted</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleStatusUpdate(student._id, 'Rejected', student.email)}>Rejected</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Row>
          </Card.Body>
        </Card>
        </Col>
        ))}
      </Row>
      {students.length > studentsPerPage && (
        <div className="d-flex justify-content-center mt-4">
                    <Pagination>
            {Array.from({ length: totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === activePage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </Container>
  );
}
export default StudentListingsPage;