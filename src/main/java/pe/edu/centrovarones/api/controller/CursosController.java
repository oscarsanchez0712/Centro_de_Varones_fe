package pe.edu.centrovarones.api.controller;
import pe.edu.centrovarones.api.service.AcademicService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/cursos")
public class CursosController { private final AcademicService s; public CursosController(AcademicService s){this.s=s;} @GetMapping public List<String> list(@RequestParam String nivel){return s.cursos(nivel);} }
