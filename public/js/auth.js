document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en el login');
        }
        
        const data = await response.json();
        sessionStorage.setItem('userData', JSON.stringify(data.user));
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = error.message;
    }
}

document.getElementById('showRegisterBtn').addEventListener('click', () => {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('cancelRegister').addEventListener('click', () => {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
});

document.getElementById('registerUserForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    nombre: document.getElementById('regName').value.trim(),
    email: document.getElementById('regEmail').value.trim().toLowerCase(),
    password: document.getElementById('regPassword').value
  };

  try {
    const response = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en el registro');
    }

    alert('Registro exitoso! Por favor inicia sesión');
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerUserForm').reset();

  } catch (error) {
    console.error('Error:', error);
    alert(error.message);
  }
});