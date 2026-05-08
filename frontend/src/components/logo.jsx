import logo from '../assets/images/original.png'; // Ajusta la ruta según dónde esté la imagen

const Logo = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
      <img 
        src={logo} 
        alt="Logo de Software para Taller Mecánico" 
        style={{
          width: '200px',      
          height: '200px',
          objectFit: 'contain', // Ajusta el tamaño de la imagen para que se adapte al contenedor
          marginTop: '20px', 
          marginBottom: '20px', 
          borderRadius: '20%', // Hace los bordes redondeados
          border: '2px solid #333', // Agrega un borde opcional
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' // Sombra opcional
        }}
      />
    </div>
  );
};

export default Logo;
