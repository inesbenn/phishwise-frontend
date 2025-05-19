import { Modal, Button, Form } from 'react-bootstrap';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function ModalForm({
  show,
  onHide,
  onSubmit,
  initialData = { status: 'active' } // valeur par défaut pour le champ status
}) {
  const isEdit = Boolean(initialData._id);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData
  });
  React.useEffect(() => {  reset(initialData); }, [initialData, reset]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier' : 'Ajouter'} un utilisateur</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              {...register('firstName', { required: 'Prénom requis' })}
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              {...register('lastName', { required: 'Nom requis' })}
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              {...register('email', {
                required: 'Email requis',
                pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' }
              })}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          { !isEdit && (
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                {...register('password', {
                  required: 'Mot de passe requis',
                  minLength: { value: 6, message: '6 caractères minimum' }
                })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Rôle</Form.Label>
            <Form.Select
              {...register('role', { required: 'Rôle requis' })}
              isInvalid={!!errors.role}
            >
              <option value="">Sélectionner</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Analyste">Analyste</option>
              <option value="Cible">Cible</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.role?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Statut</Form.Label>
            <Form.Select
              {...register('status', { required: 'Statut requis' })}
              isInvalid={!!errors.status}
            >
              <option value="">Sélectionner</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.status?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Annuler</Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
