import { useState } from 'react';
import {
  MDBContainer, MDBCol, MDBRow, MDBBtn, MDBIcon,
  MDBInput, MDBCheckbox
} from 'mdb-react-ui-kit';
import client from '../api/client';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      window.location.href = '/home';
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <>
      <style jsx global>{`
        .divider:after,
        .divider:before {
          content: "";
          flex: 1;
          height: 1px;
          background: #eee;
        }
        .h-custom {
          height: calc(100% - 73px);
        }
        @media (max-width: 450px) {
          .h-custom {
            height: 100%;
          }
        }
      `}</style>

      <MDBContainer fluid className="p-3 my-5 h-custom">
        <MDBRow>

          <MDBCol col='10' md='6'>
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Sample image"
            />
          </MDBCol>

          <MDBCol col='4' md='6'>
            <div className="d-flex flex-row align-items-center justify-content-center">
              <p className="lead fw-normal mb-0 me-3">Se connecter avec</p>
              <MDBBtn floating size='md' className='me-2'><MDBIcon fab icon='facebook-f' /></MDBBtn>
              <MDBBtn floating size='md' className='me-2'><MDBIcon fab icon='twitter' /></MDBBtn>
              <MDBBtn floating size='md' className='me-2'><MDBIcon fab icon='linkedin-in' /></MDBBtn>
            </div>

            <div className="divider d-flex align-items-center my-4">
              <p className="text-center fw-bold mx-3 mb-0">Ou</p>
            </div>

            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <MDBInput
                wrapperClass='mb-4'
                label='Email address'
                id='formControlLgEmail'
                type='email'
                size="lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Password'
                id='formControlLgPassword'
                type='password'
                size="lg"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <div className="d-flex justify-content-between mb-4">
                <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='Se souvenir de moi' />
                <a href="#!">Mot de passe oublié ?</a>
              </div>

              <div className='text-center text-md-start mt-4 pt-2'>
                <MDBBtn type="submit" className="mb-0 px-5" size='lg'>Login</MDBBtn>
                <p className="small fw-bold mt-2 pt-1 mb-2">
                  Pas de compte ? <a href="#!" className="link-danger">Inscription</a>
                </p>
              </div>
            </form>
          </MDBCol>

        </MDBRow>

        <div className="d-flex flex-column flex-md-row text-center text-md-start
                        justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">
            © 2025 PhishWise. Tous droits réservés.
          </div>
          <div>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='facebook-f' size="md"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='twitter' size="md"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='google' size="md"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='linkedin-in' size="md"/>
            </MDBBtn>
          </div>
        </div>
      </MDBContainer>
    </>
  );
}
