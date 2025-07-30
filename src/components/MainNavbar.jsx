/* eslint-disable react-hooks/rules-of-hooks */
import { Container, Nav, Navbar, Stack, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../assets/—Pngtree—cat paw cute emoticon pack_5935427.png";
import "bootstrap/dist/css/bootstrap.min.css";

const NavBar = () => {
  return (
    <Navbar
      bg="light"
      expand="lg"
      sticky="top"
      className="shadow-sm mb-4"
      style={{ backgroundColor: "#eaffea" }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center gap-2"
        >
          <Image
            src={logo}
            width="50"
            height="50"
            alt="App Logo"
            className="d-inline-block"
          />
          <span
            className="fw-bold fs-4 text-success glow"
            style={{ cursor: "pointer" }}
          >
            5od ta3 e7gez
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-content" />

        <Navbar.Collapse id="navbar-content" className="justify-content-end">
          <Nav>
            <Stack direction="horizontal" gap={3}>
              <span id="wel" className="text-muted fs-6 text-center">
                Welcome 😊
              </span>
              {/* You can add links here like Login or Bookings */}
              {/* <Nav.Link as={Link} to="/booking">My Bookings</Nav.Link> */}
            </Stack>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
