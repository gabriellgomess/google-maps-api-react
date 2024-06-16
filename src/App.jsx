import React, { useState, useEffect } from 'react';
import { Map, Pin, AdvancedMarker, InfoWindow, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

// Componente principal da aplicação
const App = () => {
  // Definição do ponto de interesse (POI) com chave e localização
  const poi = {
    key: 'poi',
    location: { lat: -29.835463, lng: -51.124084 }
  };

  // Estado para controlar a abertura do InfoWindow
  const [open, setOpen] = useState(false);
  // Estado para armazenar a localização do marcador pesquisado
  const [searchLocation, setSearchLocation] = useState(null);
  // Obtenção da instância do mapa
  const map = useMap();
  // Carregamento da biblioteca de rotas do Google Maps
  const routesLibraries = useMapsLibrary("routes");

  return (
    // Container centralizado para o mapa
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Container para definir o tamanho do mapa */}
      <div style={{ width: '70vw', height: '70vh' }}>
        {/* Componente de pesquisa de endereço */}
        <div style={{margin: '20px 0'}}>
          <SearchBox setSearchLocation={setSearchLocation} />
        </div>
        
        {/* Componente do mapa com zoom e centro padrão */}
        <Map
          defaultZoom={13}
          defaultCenter={searchLocation || { lat: -29.835463, lng: -51.124084 }}
          mapId='a5269955179648d4'
        >
          {/* Marcador avançado no mapa */}
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            onClick={() => setOpen(true)}
          >
            {/* Pino personalizado para o marcador */}
            <Pin
              background={'#FBBC04'}
              glyphColor={'#fff'}
              borderColor={'#000'}
            />
            {/* InfoWindow exibido ao clicar no marcador */}
            {open && (
              <InfoWindow
                onCloseClick={() => setOpen(false)}
                position={poi.location}
              >
                <div>
                  <p>Nossa casa</p>
                </div>
              </InfoWindow>
            )}
          </AdvancedMarker>
          {/* Marcador para a localização pesquisada */}
          {searchLocation && (
            <AdvancedMarker
              key="search"
              position={searchLocation}
            >
              <Pin
                background={'#4285F4'}
                glyphColor={'#fff'}
                borderColor={'#000'}
              />
            </AdvancedMarker>
          )}
          {/* Componente de direções */}
          <Directions map={map} routesLibraries={routesLibraries} />
        </Map>
      </div>
    </div>
  );
}

// Componente para exibir direções no mapa
const Directions = ({ map, routesLibraries }) => {
  // Estados para armazenar serviço e renderizador de direções
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  // Estado para armazenar rotas e índice da rota selecionada
  const [routes, setRoutes] = useState([]);
  const [routesIndex, setRoutesIndex] = useState(0);
  const selected = routes[routesIndex];
  const leg = selected?.legs[0];

  // Efeito para inicializar serviço e renderizador de direções
  useEffect(() => {
    if (!routesLibraries || !map) return;
    const ds = new google.maps.DirectionsService();
    const dr = new google.maps.DirectionsRenderer({ map });
    setDirectionsService(ds);
    setDirectionsRenderer(dr);
  }, [map, routesLibraries]);

  // Efeito para calcular rotas ao inicializar o serviço de direções
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;
    const request = {
      origin: { lat: -29.842412, lng: -51.139362 },
      destination: { lat: -29.835463, lng: -51.124084 },
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true
    };
    directionsService.route(request)
      .then((result) => {
        directionsRenderer.setDirections(result);
        setRoutes(result.routes);
      });
  }, [directionsService, directionsRenderer]);

  // Efeito para atualizar o índice da rota no renderizador
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routesIndex);
  }, [routesIndex, directionsRenderer]);

  if (!leg) return null;

  // Exibindo informações da rota selecionada
  return (
    <div className='directions'>
      <p>Distância {leg.distance.text}</p>
      <p>Duração {leg.duration.text}</p>
      <p>Início {leg.start_address.split(',')[0]}</p>
      <p>Fim {leg.end_address.split(',')[0]}</p>
      <p>Outras rotas</p>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRoutesIndex(index)}>{route.summary}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Componente de pesquisa de endereço
const SearchBox = ({ setSearchLocation }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleInput = (e) => {
    // Atualiza o valor do input
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    // Atualiza o valor do input com o endereço selecionado
    setValue(address, false);
    // Limpa as sugestões
    clearSuggestions();

    try {
      // Obtém as coordenadas geográficas do endereço selecionado
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      // Define a localização pesquisada
      setSearchLocation({ lat, lng });
    } catch (error) {
      console.log("Erro ao buscar coordenadas: ", error);
    }
  };

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder="Digite um endereço"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};

export default App;
