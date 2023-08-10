class Analizador{
    constructor(id,token,espacio) {
        this.id = id
        this.espacio=espacio
        this.llave=token
    }
    async AudioFeatures(trackId) {
        let response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${this.llave}`
            }
        });
        let cancionInfo = await response.json()
        return cancionInfo
    }

    async obtenerDatos() {
        let cancionId = this.id
        let caracteristicas = await this.AudioFeatures(cancionId)
        let energia = caracteristicas.energy
        let valencia = caracteristicas.valence
        let bailabilidad = caracteristicas.danceability
        let tempo = caracteristicas.tempo
        let estadoAnimo = this.obtenerEstadoAnimo(energia, valencia, bailabilidad)
        let estadoMelodia = this.obtenerEstadoMelodia(tempo)
        let estadoTranquilidad = this.obtenerEstadoTranquilidad(bailabilidad)
        let datos=[estadoAnimo,estadoMelodia, estadoTranquilidad]
        this.obtenerGrafico(this.espacio,datos)
    }

    obtenerEstadoAnimo(energia, valencia, bailabilidad) {
        let EnergiaMuyAlta = 0.8
        let EnergiaAlta = 0.6
        let EnergiaMedia = 0.4
        let EnergiaBaja = 0.2
        let umbralValenciaMuyAlta = 0.8
        let umbralValenciaAlta = 0.6
        let umbralValenciaMedia = 0.4
        let umbralValenciaBaja = 0.2
        let umbralBailabilidadMuyAlta = 0.8
        let umbralBailabilidadAlta = 0.6
        let umbralBailabilidadMedia = 0.4
        let umbralBailabilidadBaja = 0.2
        if (energia >= EnergiaMuyAlta && valencia >= umbralValenciaMuyAlta && bailabilidad >= umbralBailabilidadMuyAlta) {
            return 100
        } else if (energia >= EnergiaAlta && valencia >= umbralValenciaAlta && bailabilidad >= umbralBailabilidadAlta) {
            return 80
        } else if (energia >= EnergiaMedia && valencia >= umbralValenciaMedia && bailabilidad >= umbralBailabilidadMedia) {
            return 60
        } else if (energia >= EnergiaBaja && valencia >= umbralValenciaBaja && bailabilidad >= umbralBailabilidadBaja) {
            return 50
        } else if (energia <= EnergiaBaja && valencia <= umbralValenciaBaja && bailabilidad <= umbralBailabilidadBaja) {
            return 40
        } else if (energia <= EnergiaMedia && valencia <= umbralValenciaMedia && bailabilidad <= umbralBailabilidadMedia) {
            return 30
        } else if (energia <= EnergiaAlta && valencia <= umbralValenciaAlta && bailabilidad <= umbralBailabilidadAlta) {
            return 20
        } else if (energia <= EnergiaMuyAlta && valencia <= umbralValenciaMuyAlta && bailabilidad <= umbralBailabilidadMuyAlta) {
            return 10
        } else {
            return 5
        }
    }

    obtenerEstadoTranquilidad(baile){
        let MuyAlta = 0.8
        let Alta = 0.6
        let Media = 0.4
        let Baja = 0.2

        if (baile >= MuyAlta) {
            return 100
        } else if (baile >= Alta) {
            return 80
        } else if (baile >= Media) {
            return 50
        } else if (baile >= Baja) {
            return 30
        } else {
            return 10
        }
    }

    obtenerEstadoMelodia(tempo) {
        let umbralTempoAlto = 120;
        let umbralTempoBajo = 80;
        if (tempo >= umbralTempoAlto) {
            return 100
        } else if (tempo <= umbralTempoBajo) {
            return 20
        } else {
            return 50
        }
    }

    obtenerGrafico(dom,cancion) {
        let [animo,melodia,tranquilidad] = cancion;
        let chartContainer = document.createElement('div');
        chartContainer.classList.add('flex', 'justify-center', 'items-center');

        let chartDom = document.createElement('div');
        chartDom.style.width = '800px'
        chartDom.style.height = '250px'

        chartContainer.appendChild(chartDom);

        let myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false,
        });
        var option = {
            title: {
                text: `Animometro`,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            grid: {
                top: 50,
                bottom: 15,
            },
            xAxis: {
                type: 'value',
                position: 'top',
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                    },
                },
                max:100,
            },
            yAxis: {
                type: 'category',
                axisLine: { show: true },
                axisLabel: { show: true, color : 'white' },
                axisTick: { show: true },
                splitLine: { show: true },
                data: ['Felicidad', 'Vibras','Tranquilidad'],
            },
            series: [
                {
                    name: 'Resultado',
                    type: 'bar',
                    stack: 'Total',
                    label: {
                        show: true,
                        color: 'white', // Set label text color to white
                        formatter: '{c}',
                        position: 'insideRight',
                    },
                    itemStyle: { // Set colors for the bars
                        color: function (params) {
                            let colorList = ['#ff7878', '#5ab1ef', '#f7a35c'];
                            return colorList[params.dataIndex];
                        },
                    },

                    data: [
                        { value: animo, label: option },
                        { value: melodia, label: option },
                        { value: tranquilidad, label:option}
                    ],
                },
            ],
        };


        if (option && typeof option === 'object') {
            myChart.setOption(option)
        }
        dom.appendChild(chartContainer)
        window.addEventListener('resize', myChart.resize)
    }
}