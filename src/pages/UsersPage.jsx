import { useEffect, useState } from 'react';
import {
  Container, Row, Col,
  Table, Button,
  InputGroup, FormControl,
  Pagination
} from 'react-bootstrap';
import ModalForm from '../components/ModalForm';
import client from '../api/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await client.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Erreur chargement users:', err);
      alert('Impossible de charger les utilisateurs');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & paginate
  const filtered = users.filter(u =>
    u.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    u.lastName.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );
  const total = filtered.length;
  const pages = Math.ceil(total / perPage);
  const displayed = filtered.slice((page - 1) * perPage, page * perPage);

  // Delete user
  const handleDelete = async id => {
    if (window.confirm('Supprimer cet utilisateur ?')) {
      try {
        await client.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error('Erreur suppression:', err);
        alert('Impossible de supprimer');
      }
    }
  };

  // Create or update
  const handleSubmit = async data => {
    try {
      if (editData && editData._id) {
        await client.put(`/users/${editData._id}`, data);
      } else {
        await client.post('/users', data);
      }
      setShowModal(false);
      setEditData(null);
      fetchUsers();
    } catch (err) {
      console.error('API Error:', err.response?.data);
      const message = err.response?.data?.message
        || (err.response?.data?.errors && err.response.data.errors.map(e => e.msg).join(', '))
        || 'Erreur inattendue';
      alert(`Erreur API : ${message}`);
    }
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col><h2>Gestion des utilisateurs</h2></Col>
        <Col className="text-end">
          <Button onClick={() => { setEditData(null); setShowModal(true); }}>
            + Ajouter
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <FormControl
              placeholder="Recherche..."
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
            />
          </InputGroup>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(u => (
            <tr key={u._id}>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                <Button
                  size="sm" variant="warning" className="me-2"
                  onClick={() => { setEditData(u); setShowModal(true); }}
                >
                  Modifier
                </Button>
                <Button
                  size="sm" variant="danger"
                  onClick={() => handleDelete(u._id)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        <Pagination.Prev
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        />
        {[...Array(pages)].map((_, i) => (
          <Pagination.Item
            key={i}
            active={i + 1 === page}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={page === pages}
          onClick={() => setPage(p => p + 1)}
        />
      </Pagination>

      {/* ModalForm for create/edit */}
      <ModalForm
        show={showModal}
        onHide={() => setShowModal(false)}
        initialData={editData || { status: 'active' }}
        onSubmit={handleSubmit}
      />
    </Container>
  );
}
