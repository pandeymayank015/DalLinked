import React, { useState, useEffect } from "react";
import {Container, ListGroup, Pagination, Modal, Row, Col, Button, Form, Dropdown} from "react-bootstrap";
import NewAnnouncementForm from "../components/NewAnnouncementForm";
import AnnouncementsList from "../components/AnnouncementsList";
import "../styles/Announcements.css";
import axios from "axios";
import { useAuthContext } from "../hooks/useAuthContext";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Footer from "./../components/Footer";
function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [showNewAnnouncementModal, setShowNewAnnouncementModal] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useAuthContext();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const announcementsUrl = `${backendUrl}/announcements`;

  const fetchAnnouncements = async (userToken) => {
    try {
      const response = await axios.get(announcementsUrl, {
        headers: {
          Authorization: "Bearer " + userToken,
        },
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const deleteAnnouncement = async (_id) => {
    try {
      const response = await axios.delete(`${announcementsUrl}/${_id}`);
      if (response.status === 200) {
        const updatedAnnouncements = announcements.filter(
          (announcement) => announcement._id !== _id
        );
        setAnnouncements(updatedAnnouncements);
        setShowDeleteModal(false);
        toast.success("Announcement deleted successfully.");
      } else {
        console.error("Error deleting announcement:", response.status);
        toast.error("Error in deleting announcement.");
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Error in deleting announcement.");
    }
  };

  const handleDelete = (_id) => {
    const announcement = announcements.find(
      (announcement) => announcement._id === _id
    );
    setAnnouncementToDelete(announcement);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmation = () => {
    deleteAnnouncement(announcementToDelete._id);
  };

  const handleNewAnnouncement = () => {
    setShowNewAnnouncementModal(true);
  };

  const handleNewAnnouncementSubmit = async (title, body) => {
    try {
      const response = await axios.post(announcementsUrl, {
        title,
        body,
      });
      if (response.status === 200) {
        fetchAnnouncements(user.token);
        setShowNewAnnouncementModal(false);
        toast.success("Announcement posted successfully.");
      } else {
        console.error("Error creating announcement:", response.status);
        toast.error("Error in posting announcement.");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Error in posting announcement.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (eventKey) => {
    setSortOrder(eventKey);
  };

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
    const date1 = new Date(a.datePosted);
    const date2 = new Date(b.datePosted);
    if (sortOrder === "asc") {
      return date1.getTime() - date2.getTime();
    } else {
      return date2.getTime() - date1.getTime();
    }
  });

  const announcementsPerPage = 5;
  const totalPages = Math.ceil(
    sortedAnnouncements.length / announcementsPerPage
  );
  const [activePage, setActivePage] = useState(1);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  useEffect(() => {
    setActivePage(1);
  }, [totalPages]);

  const indexOfLastAnnouncement = activePage * announcementsPerPage;
  const indexOfFirstAnnouncement =
    indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = sortedAnnouncements.slice(
    indexOfFirstAnnouncement,
    indexOfLastAnnouncement
  );

  useEffect(() => {
    if (user) {
      fetchAnnouncements(user.token);
    }
  }, [user]);

  if (!user) {
    return <p>Please signin to access this page.</p>;
  }

  return (
    <>
      <Container>
        <h3 className="text-center mt-3 mb-3">Announcements</h3>
        <Row className="justify-content-center">
          <Col sm={12} md={10} lg={8}>
            <ListGroup className="text-left md-8">
              <ListGroup.Item className="d-flex justify-content-between align-items-center p-0 mb-3 border-0">
                <div className="d-flex flex-grow-1 me-2">
                  <Form.Control
                    type="text"
                    placeholder="Search announcement"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: "100%" }}
                  />
                </div>
                <Dropdown onSelect={handleSortChange} className="me-2">
                  <Dropdown.Toggle
                    style={{
                      color: "grey",
                      backgroundColor: "rgba(200, 209, 214, 0.5)",
                      borderRadius: "25px",
                    }}
                  >
                    Sort
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="asc">Oldest first</Dropdown.Item>
                    <Dropdown.Item eventKey="desc">Latest first</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {user.userType === "admin" && (
                  <Button
                    style={{
                      color: "green",
                      backgroundColor: "rgba(200, 209, 214, 0.5)",
                      borderRadius: "25px",
                    }}
                    onClick={handleNewAnnouncement}
                  >
                    New
                  </Button>
                )}
              </ListGroup.Item>
              <AnnouncementsList
                announcements={currentAnnouncements}
                userType={user.userType}
                onDelete={handleDelete}
              />
            </ListGroup>
          </Col>
        </Row>
        {filteredAnnouncements.length > announcementsPerPage && (
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
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete "{announcementToDelete?.title}"
            announcement?
          </Modal.Body>
          <Modal.Footer>
            <Button
              style={{
                color: "grey",
                backgroundColor: "rgba(200, 209, 214, 0.5)",
                borderRadius: "25px",
              }}
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              style={{
                color: "red",
                backgroundColor: "rgba(200, 209, 214, 0.5)",
                borderRadius: "25px",
              }}
              onClick={handleDeleteConfirmation}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showNewAnnouncementModal}
          onHide={() => setShowNewAnnouncementModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>New Announcement</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <NewAnnouncementForm onSubmit={handleNewAnnouncementSubmit} />
          </Modal.Body>
        </Modal>
        <ToastContainer />
      </Container>
      <Footer />
    </>
  );
}

export default AnnouncementPage;
