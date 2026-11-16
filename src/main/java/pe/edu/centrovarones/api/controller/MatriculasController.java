package pe.edu.centrovarones.api.controller;
import pe.edu.centrovarones.api.service.AcademicService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController @RequestMapping("/api/matriculas")
public class MatriculasController {
 private static final Logger log=LoggerFactory.getLogger(MatriculasController.class);
 private final AcademicService service; public MatriculasController(AcademicService s){service=s;}
 @GetMapping public List<Map<String,Object>> list(){return service.matriculas();}
 @PatchMapping("/{numero}") public Map<String,Object> update(@PathVariable String numero,@RequestBody Map<String,Object> body){try{var x=service.updateMatricula(numero,body);if(x==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Solicitud no encontrada.");return x;}catch(DuplicateKeyException e){throw new ResponseStatusException(HttpStatus.CONFLICT,"El DNI ya tiene matrícula registrada para este año.");}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@RequestBody Map<String,Object> r){try{return service.createMatricula(r);}catch(DuplicateKeyException e){throw new ResponseStatusException(HttpStatus.CONFLICT,"El estudiante ya tiene matrícula registrada para este año.");}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}catch(DataAccessException e){Object student=r.get("estudiante");Object dni=student instanceof Map<?,?> map?map.get("dni"):null;log.error("Error SQL al registrar matrícula para DNI {}",dni,e);throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"No se pudo guardar la matrícula en SQL Server. Revisa el log del backend.");}}
 @GetMapping("/solicitud/{numero}") public Map<String,Object> solicitud(@PathVariable String numero){var x=service.bySolicitud(numero);if(x==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Solicitud no encontrada.");return x;}
 @GetMapping("/dni/{dni}") public Map<String,Object> dni(@PathVariable String dni){var x=service.byDni(dni);if(x==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No hay matrícula para ese DNI.");return x;}
 @PatchMapping("/{numero}/estado") public Map<String,Object> state(@PathVariable String numero,@RequestBody Map<String,String> body){try{var x=service.updateEstado(numero,body.getOrDefault("estado",""));if(x==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Solicitud no encontrada.");return x;}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}}
}
