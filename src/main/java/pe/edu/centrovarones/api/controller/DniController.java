package pe.edu.centrovarones.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/dni")
public class DniController {
    private static final ParameterizedTypeReference<Map<String, Object>> MAP_TYPE =
            new ParameterizedTypeReference<>() {};

    private final RestClient client;
    private final String token;

    public DniController(
            RestClient.Builder builder,
            @Value("${dni-ruc.base-url}") String baseUrl,
            @Value("${dni-ruc.token:}") String token) {
        this.client = builder.baseUrl(baseUrl).build();
        this.token = token;
    }

    @GetMapping("/{dni}")
    public Map<String, Object> consultar(@PathVariable String dni) {
        if (!dni.matches("\\d{8}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El DNI debe tener 8 dígitos.");
        }
        if (token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "La consulta de DNI no está configurada.");
        }

        try {
            Map<String, Object> respuesta = client.get()
                    .uri(uriBuilder -> uriBuilder.path("/{dni}").queryParam("token", token).build(dni))
                    .retrieve()
                    .body(MAP_TYPE);
            if (respuesta == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El servicio de DNI devolvió una respuesta vacía.");
            }
            return respuesta;
        } catch (RestClientResponseException e) {
            HttpStatus status = e.getStatusCode().value() == 404 ? HttpStatus.NOT_FOUND : HttpStatus.BAD_GATEWAY;
            throw new ResponseStatusException(status, "No se pudo consultar el DNI en el servicio externo.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo conectar con el servicio externo de DNI.");
        }
    }
}