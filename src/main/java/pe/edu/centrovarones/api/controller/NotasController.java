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
@RestController @RequestMapping("/api/notas")
public class NotasController { private static final Logger log=LoggerFactory.getLogger(NotasController.class); private final AcademicService s; public NotasController(AcademicService s){this.s=s;}
 @GetMapping public List<Map<String,Object>> list(){return s.notas();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> create(@RequestBody Map<String,Object> r){try{return s.createNota(r);}catch(NoSuchElementException e){throw new ResponseStatusException(HttpStatus.NOT_FOUND,e.getMessage());}catch(IllegalArgumentException e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,e.getMessage());}catch(DuplicateKeyException e){throw new ResponseStatusException(HttpStatus.CONFLICT,e.getMessage());}catch(DataAccessException e){log.error("Error SQL al registrar una nota para DNI {} y curso {}",r.get("dni"),r.get("curso"),e);throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"No se pudo guardar la nota en SQL Server. Revisa el log del backend.");}}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable long id){if(!s.deleteNota(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND);}
}
