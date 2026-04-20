import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter_animate/flutter_animate.dart';

class PlayerScreen extends StatefulWidget {
  final String url;
  final String type; // 'live' or 'vod'

  const PlayerScreen({super.key, required this.url, required this.type});

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late VideoPlayerController _videoController;
  ChewieController? _chewieController;
  String? _currentSubtitle = "";
  
  @override
  void initState() {
    super.initState();
    _initializePlayer();
    
    if (widget.type == 'live') {
      _startLiveSubtitleSimulation();
    }
  }

  void _initializePlayer() async {
    _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.url));
    await _videoController.initialize();
    
    _chewieController = ChewieController(
      videoPlayerController: _videoController,
      autoPlay: true,
      looping: false,
      isLive: widget.type == 'live',
      // Regra: Em VOD, permitimos seleção de múltiplas faixas de áudio se disponível
      additionalOptions: (context) => [
        OptionItem(
          onTap: () => _showAudioSelector(),
          iconData: Icons.audiotrack,
          title: 'Idioma da Dublagem (IA)',
        ),
      ],
    );
    
    setState(() {});
  }

  // --- BYPASS DE LATÊNCIA ---
  // Para 'live', buscamos eventos de uma API de dados externa (simulado)
  // em vez de tentar processar o áudio com IA em tempo real.
  void _startLiveSubtitleSimulation() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _currentSubtitle = "⚽ GOL! Neymar marca para o Brasil!");
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) setState(() => _currentSubtitle = "");
        });
      }
    });
  }

  void _showAudioSelector() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Escolha o Idioma da Dublagem IA", style: TextStyle(fontWeight: FontWeight.bold)),
            ListTile(title: const Text("Original (EN)"), onTap: () => Navigator.pop(context)),
            ListTile(title: const Text("Português (IA)"), leading: const Icon(Icons.auto_awesome), onTap: () => Navigator.pop(context)),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _videoController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.type == 'live' ? 'AO VIVO' : 'VOD ENRICHED')),
      body: Column(
        children: [
          // Player Area
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(
              children: [
                _chewieController != null 
                  ? Chewie(controller: _chewieController!)
                  : const Center(child: CircularProgressIndicator()),
                
                // Overlay de Legendas Inteligentes (LIVE)
                if (widget.type == 'live' && _currentSubtitle != "")
                  Positioned(
                    bottom: 60,
                    left: 20,
                    right: 20,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _currentSubtitle!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ).animate().fadeIn().slideY(begin: 0.5),
                  ),
              ],
            ),
          ),
          
          // Info Area
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: ListView(
                children: [
                  Text(
                    widget.type == 'live' 
                      ? "Modo: Baixa Latência (Bypass de IA)"
                      : "Modo: VOD Enriched (Dublagem IA)",
                    style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Este canal utiliza injeção dinâmica de anúncios SSAI via manifest proxy. Os anúncios são detectados nativamente pelo player.",
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
