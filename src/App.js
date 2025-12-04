/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNotifications } from './hooks/useNotifications';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const pokemonsPerPage = 30;
  const totalPokemons = 1302;

  // Hook de notificaciones
  const { solicitarPermisoNotificaciones, enviarNotificacion } = useNotifications();

  useEffect(() => {
    fetchAllPokemons();
    // Solicitar permiso de notificaciones al cargar la app
    if ("Notification" in window && Notification.permission === "default") {
      setTimeout(() => {
        if (window.confirm("¿Quieres activar las notificaciones para recibir alertas sobre Pokémon?")) {
          solicitarPermisoNotificaciones();
        }
      }, 2000);
    }
  }, []);

  useEffect(() => {
    filterPokemons();
  }, [searchTerm, pokemons]);

  const fetchAllPokemons = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1302");
      const data = await response.json();
      setPokemons(data.results);
      setLoading(false);
      
      // Notificación de carga completa
      enviarNotificacion(
        "¡Pokédex cargada!",
        `Se han cargado ${data.results.length} Pokémon`,
        "/logo192.png"
      );
    } catch (error) {
      console.error("Error fetching pokemons:", error);
      setLoading(false);
    }
  };

  const filterPokemons = () => {
    if (searchTerm === "") {
      setFilteredPokemons(pokemons);
    } else {
      const filtered = pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemons(filtered);
      
      // Notificación cuando se encuentra Pokémon en búsqueda
      if (filtered.length > 0 && searchTerm !== "") {
        enviarNotificacion(
          "¡Búsqueda exitosa!",
          `Encontrados ${filtered.length} Pokémon con "${searchTerm}"`,
          `/https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(filtered[0].url)}.png`
        );
      }
    }
    setCurrentPage(1);
  };

  const getPokemonId = (url) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2];
  };

  const viewPokemonDetails = async (pokemon) => {
    const pokemonId = getPokemonId(pokemon.url);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const details = await response.json();
      setSelectedPokemon(details);
      
      // Notificación al ver detalles
      enviarNotificacion(
        `¡${details.name.toUpperCase()} consultado!`,
        `Has visto los detalles de ${details.name}`,
        details.sprites.front_default
      );
    } catch (error) {
      console.error("Error fetching Pokémon details:", error);
    }
  };

  const toggleFavorite = (pokemon) => {
    const pokemonId = getPokemonId(pokemon.url);
    const isCurrentlyFavorite = favorites.includes(pokemonId);
    
    if (isCurrentlyFavorite) {
      setFavorites(favorites.filter(id => id !== pokemonId));
    } else {
      setFavorites([...favorites, pokemonId]);
      
      // Notificación al agregar a favoritos
      enviarNotificacion(
        "¡Pokémon favorito!",
        `${pokemon.name} se agregó a tus favoritos`,
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
      );
    }
  };

  const isFavorite = (pokemonId) => {
    return favorites.includes(pokemonId);
  };

  const closeDetails = () => {
    setSelectedPokemon(null);
  };

  // Calcular Pokémon para la página actual
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Cargando Pokémon...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokédex</h1>
        <p className="subtitle">Todos los Pokémon en una PWA</p>
        
        {/* Botón de notificaciones */}
        <div className="notification-section">
          <button 
            onClick={solicitarPermisoNotificaciones}
            className="notification-btn"
            title="Activar notificaciones push"
          >
            🔔 {Notification.permission === "granted" ? "Notificaciones Activadas" : "Activar Notificaciones"}
          </button>
          <span className="notification-status">
            Estado: {Notification.permission === "granted" ? "✅ Activadas" : 
                    Notification.permission === "denied" ? "❌ Bloqueadas" : "⏳ Pendiente"}
          </span>
        </div>

        {/* Buscador */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-count">
            {filteredPokemons.length} Pokémon encontrados
          </div>
        </div>
      </header>

      <main className="pokedex-container">
        {/* Paginación superior */}
        {totalPages > 1 && (
          <div className="pagination-top">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Anterior
            </button>
            
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Grid de Pokémon */}
        <div className="pokemon-grid">
          {currentPokemons.map((pokemon, index) => {
            const pokemonId = getPokemonId(pokemon.url);
            const favorite = isFavorite(pokemonId);
            
            return (
              <div 
                key={pokemonId} 
                className={`pokemon-card ${favorite ? 'favorite' : ''}`}
                onClick={() => viewPokemonDetails(pokemon)}
              >
                <div className="pokemon-id">#{pokemonId}</div>
                <button 
                  className={`favorite-btn ${favorite ? 'favorited' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pokemon);
                  }}
                  title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  {favorite ? '❤️' : '🤍'}
                </button>
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`} 
                  alt={pokemon.name}
                  className="pokemon-image"
                  onError={(e) => {
                    e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png`;
                  }}
                />
                <h3 className="pokemon-name">{pokemon.name}</h3>
              </div>
            );
          })}
        </div>

        {/* Paginación inferior */}
        {totalPages > 1 && (
          <div className="pagination-bottom">
            <button 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              ← Anterior
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Modal de detalles del Pokémon */}
        {selectedPokemon && (
          <div className="modal-overlay" onClick={closeDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeDetails}>×</button>
              <h2>{selectedPokemon.name} #{selectedPokemon.id}</h2>
              <img 
                src={selectedPokemon.sprites.front_default} 
                alt={selectedPokemon.name}
                className="pokemon-detail-image"
              />
              <div className="pokemon-details">
                <p><strong>Altura:</strong> {selectedPokemon.height / 10} m</p>
                <p><strong>Peso:</strong> {selectedPokemon.weight / 10} kg</p>
                <p><strong>Tipos:</strong> {selectedPokemon.types.map(type => type.type.name).join(', ')}</p>
                <p><strong>Habilidades:</strong> {selectedPokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
              </div>
              <button 
                className={`favorite-btn-large ${isFavorite(selectedPokemon.id.toString()) ? 'favorited' : ''}`}
                onClick={() => toggleFavorite({name: selectedPokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${selectedPokemon.id}/`})}
              >
                {isFavorite(selectedPokemon.id.toString()) ? '❤️ Quitar de Favoritos' : '🤍 Agregar a Favoritos'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;